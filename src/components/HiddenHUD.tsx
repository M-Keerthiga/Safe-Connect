import { useState, useEffect } from 'react';
import { X, Shield, AlertTriangle, Plus, Trash2, Eye, EyeOff, Info } from 'lucide-react';
import { supabase, type Canary } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface HiddenHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HiddenHUD({ isOpen, onClose }: HiddenHUDProps) {
  const { user, profile } = useAuth();
  const [canaries, setCanaries] = useState<Canary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCanary, setNewCanary] = useState({
    trigger_type: 'phrase' as Canary['trigger_type'],
    trigger_value: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchCanaries();
    }
  }, [isOpen, user]);

  const fetchCanaries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('canaries')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setCanaries(data);
    setLoading(false);
  };

  const handleAddCanary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCanary.trigger_value.trim()) return;

    const { error } = await supabase.from('canaries').insert({
      user_id: user?.id,
      trigger_type: newCanary.trigger_type,
      trigger_value: newCanary.trigger_value,
      description: newCanary.description || null,
    });

    if (!error) {
      await fetchCanaries();
      setNewCanary({ trigger_type: 'phrase', trigger_value: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteCanary = async (id: string) => {
    await supabase.from('canaries').delete().eq('id', id);
    setCanaries((c) => c.filter((ca) => ca.id !== id));
  };

  const handleToggleCanary = async (canary: Canary) => {
    await supabase
      .from('canaries')
      .update({ is_active: !canary.is_active })
      .eq('id', canary.id);
    await fetchCanaries();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="w-full max-w-md bg-cc-card rounded-2xl shadow-2xl hud-reveal overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-cc-border bg-gradient-to-r from-safety-accent/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-safety-accent flex items-center justify-center cc-glow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Hidden Safety HUD</h2>
                <p className="text-xs text-cc-muted">Secret distress configuration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-cc-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-cc-bg/50 border-b border-cc-border">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-safety-accent mt-0.5" />
            <p className="text-sm text-cc-muted">
              Configure secret triggers (canaries) that will silently alert your contacts.
              These phrases or emojis will look normal to others but trigger distress alerts.
            </p>
          </div>
        </div>

        {/* Canary List */}
        <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-cc-muted">Loading...</div>
          ) : canaries.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-cc-muted mx-auto mb-3" />
              <p className="text-cc-muted text-sm">No canaries configured yet</p>
              <p className="text-cc-muted text-xs mt-1">Add trigger phrases to activate hidden distress alerts</p>
            </div>
          ) : (
            canaries.map((canary) => (
              <div
                key={canary.id}
                className={`p-3 rounded-lg border transition-all ${
                  canary.is_active
                    ? 'border-safety-accent/50 bg-safety-accent/10'
                    : 'border-cc-border opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                        canary.trigger_type === 'emoji' ? 'bg-orange-500/20 text-orange-400' :
                        canary.trigger_type === 'pattern' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {canary.trigger_type}
                      </span>
                      {canary.is_active && (
                        <span className="text-xs text-safety-success">● Active</span>
                      )}
                    </div>
                    <p className="text-white font-mono mt-2 text-sm bg-cc-bg px-2 py-1 rounded inline-block">
                      {canary.trigger_value}
                    </p>
                    {canary.description && (
                      <p className="text-xs text-cc-muted mt-1">{canary.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleCanary(canary)}
                      className="p-1.5 text-cc-muted hover:text-safety-accent"
                    >
                      {canary.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteCanary(canary.id)}
                      className="p-1.5 text-cc-muted hover:text-safety-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Form */}
        {showAddForm ? (
          <form onSubmit={handleAddCanary} className="p-4 border-t border-cc-border bg-cc-bg/50">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-cc-muted">Type</label>
                <div className="flex gap-2 mt-1">
                  {(['phrase', 'emoji', 'pattern'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewCanary({ ...newCanary, trigger_type: type })}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${
                        newCanary.trigger_type === type
                          ? 'bg-safety-accent text-white'
                          : 'bg-cc-card text-cc-muted'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-cc-muted">Trigger Value</label>
                <input
                  type="text"
                  value={newCanary.trigger_value}
                  onChange={(e) => setNewCanary({ ...newCanary, trigger_value: e.target.value })}
                  placeholder={
                    newCanary.trigger_type === 'phrase' ? 'e.g., staying home tonight' :
                    newCanary.trigger_type === 'emoji' ? 'e.g., 🍍🆘' :
                    'e.g., exactly (a-z)'
                  }
                  className="w-full bg-cc-card border border-cc-border rounded px-3 py-2 text-sm text-white font-mono mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-cc-muted">Description (optional)</label>
                <input
                  type="text"
                  value={newCanary.description}
                  onChange={(e) => setNewCanary({ ...newCanary, description: e.target.value })}
                  placeholder="What does this trigger mean?"
                  className="w-full bg-cc-card border border-cc-border rounded px-3 py-2 text-sm text-white mt-1"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded bg-cc-card text-cc-muted text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-safety-accent text-white text-sm font-medium"
                >
                  Add Canary
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 border-t border-cc-border">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full btn btn-primary py-2.5"
            >
              <Plus className="w-4 h-4" />
              Add New Canary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
