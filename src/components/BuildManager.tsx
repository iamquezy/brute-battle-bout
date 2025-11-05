import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Save, Download, Trash2, Edit2 } from 'lucide-react';
import { Character } from '@/types/game';
import { EquipmentSlots } from '@/types/equipment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SavedBuild {
  id: string;
  name: string;
  character_data: {
    stats: Character['stats'];
    equipment: EquipmentSlots;
    skills: string[];
    specialization: string | null;
  };
  created_at: string;
}

interface BuildManagerProps {
  open: boolean;
  onClose: () => void;
  currentCharacter: Character;
  currentEquipment: EquipmentSlots;
  currentSkills: string[];
  currentSpecialization: string | null;
  userId: string;
  onLoadBuild: (build: SavedBuild) => void;
}

export const BuildManager = ({
  open,
  onClose,
  currentCharacter,
  currentEquipment,
  currentSkills,
  currentSpecialization,
  userId,
  onLoadBuild,
}: BuildManagerProps) => {
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [buildName, setBuildName] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadBuilds();
    }
  }, [open]);

  const loadBuilds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_builds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBuilds((data as any) || []);
    } catch (error) {
      console.error('Error loading builds:', error);
      toast.error('Failed to load builds');
    } finally {
      setLoading(false);
    }
  };

  const saveBuild = async () => {
    if (!buildName.trim()) {
      toast.error('Please enter a build name');
      return;
    }

    setLoading(true);
    try {
      const buildData = {
        user_id: userId,
        name: buildName,
        character_class: currentCharacter.class,
        character_level: currentCharacter.level,
        character_data: {
          stats: currentCharacter.stats,
          equipment: currentEquipment,
          skills: currentSkills,
          specialization: currentSpecialization,
        },
      };

      const { error } = await supabase
        .from('saved_builds')
        .insert([buildData as any]);

      if (error) throw error;

      toast.success(`Build "${buildName}" saved!`);
      setBuildName('');
      loadBuilds();
    } catch (error) {
      console.error('Error saving build:', error);
      toast.error('Failed to save build');
    } finally {
      setLoading(false);
    }
  };

  const deleteBuild = async (buildId: string, name: string) => {
    if (!confirm(`Delete build "${name}"?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('saved_builds')
        .delete()
        .eq('id', buildId);

      if (error) throw error;

      toast.success('Build deleted');
      loadBuilds();
    } catch (error) {
      console.error('Error deleting build:', error);
      toast.error('Failed to delete build');
    } finally {
      setLoading(false);
    }
  };

  const renameBuild = async (buildId: string, newName: string) => {
    if (!newName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('saved_builds')
        .update({ name: newName })
        .eq('id', buildId);

      if (error) throw error;

      toast.success('Build renamed');
      setEditingId(null);
      loadBuilds();
    } catch (error) {
      console.error('Error renaming build:', error);
      toast.error('Failed to rename build');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Save className="w-6 h-6 text-primary" />
            Build Manager
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Save and load different stat allocations, equipment setups, and skill builds
          </p>
        </DialogHeader>

        {/* Save Current Build */}
        <Card className="p-4 bg-primary/5 border-primary/30">
          <h3 className="text-sm font-bold mb-3">Save Current Build</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter build name..."
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveBuild()}
            />
            <Button onClick={saveBuild} disabled={loading || !buildName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </Card>

        {/* Saved Builds List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold">Saved Builds ({builds.length}/10)</h3>
          
          {loading && builds.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading builds...</p>
            </Card>
          ) : builds.length === 0 ? (
            <Card className="p-8 text-center">
              <Save className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No saved builds yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Save your first build above!
              </p>
            </Card>
          ) : (
            builds.map((build) => (
              <Card key={build.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === build.id ? (
                      <Input
                        defaultValue={build.name}
                        onBlur={(e) => {
                          if (e.target.value !== build.name) {
                            renameBuild(build.id, e.target.value);
                          } else {
                            setEditingId(null);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            renameBuild(build.id, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{build.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(build.id)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Level {build.character_data?.stats?.health ? 
                          Math.floor((build.character_data.stats.health || 100) / 10) : '?'}
                      </Badge>
                      {build.character_data?.specialization && (
                        <Badge variant="outline" className="text-xs">
                          {build.character_data.specialization}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {build.character_data?.skills?.length || 0} Skills
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Saved {new Date(build.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onLoadBuild(build);
                        toast.success(`Loaded build: ${build.name}`);
                        onClose();
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBuild(build.id, build.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="p-3 bg-yellow-500/10 border-yellow-500/30">
          <p className="text-xs text-yellow-600">
            ⚠️ Loading a build will replace your current equipment, skills, and stat allocations. Your level and experience will not change.
          </p>
        </Card>
      </DialogContent>
    </Dialog>
  );
};