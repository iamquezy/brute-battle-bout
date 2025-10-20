import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkillTreeNode } from '@/types/skillTree';
import { Lock, CheckCircle2, Zap } from 'lucide-react';

interface SkillTreeProps {
  open: boolean;
  onClose: () => void;
  nodes: SkillTreeNode[];
  skillPoints: number;
  onUnlockNode: (nodeId: string) => void;
}

export const SkillTree = ({ 
  open, 
  onClose, 
  nodes,
  skillPoints,
  onUnlockNode
}: SkillTreeProps) => {
  const canUnlock = (node: SkillTreeNode) => {
    if (node.unlocked) return false;
    if (skillPoints < node.cost) return false;
    if (!node.prerequisite) return true;
    return nodes.find(n => n.id === node.prerequisite)?.unlocked || false;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            Skill Tree
            <span className="text-lg ml-4">Skill Points: {skillPoints}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 p-4">
            {[0, 1, 2].map(col => (
              <div key={col} className="space-y-4">
                <h3 className="text-center font-bold capitalize">
                  {col === 0 ? 'Offense' : col === 1 ? 'Defense' : 'Utility'}
                </h3>
                {nodes.filter(n => n.column === col).sort((a, b) => a.row - b.row).map(node => (
                  <Card 
                    key={node.id}
                    className={`p-4 ${node.unlocked ? 'border-primary border-2 bg-primary/5' : 'opacity-60'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold">{node.name}</h3>
                      {node.unlocked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{node.description}</p>
                    {!node.unlocked && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        disabled={!canUnlock(node)}
                        onClick={() => onUnlockNode(node.id)}
                      >
                        Unlock ({node.cost} SP)
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
