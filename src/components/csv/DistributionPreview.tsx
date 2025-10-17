/**
 * Preview component showing distribution of CSV items across agents
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, FileText } from 'lucide-react';
import { DistributedItems } from '@/utils/distribute';
import { Agent } from '@/components/agents/AgentCard';

interface DistributionPreviewProps {
  distributed: DistributedItems[];
  agents: Agent[];
}

export function DistributionPreview({ distributed, agents }: DistributionPreviewProps) {
  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.name || `Agent ${agentId}`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold">Distribution Preview</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {distributed.map((dist) => (
          <Card key={dist.agentId} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {getAgentName(dist.agentId)}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {dist.items.length} items
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {dist.items.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 rounded bg-muted/50 flex items-start gap-2"
                    >
                      <FileText className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.firstName}</p>
                        <p className="text-muted-foreground truncate">{item.phone}</p>
                      </div>
                    </div>
                  ))}
                  {dist.items.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{dist.items.length - 5} more
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
