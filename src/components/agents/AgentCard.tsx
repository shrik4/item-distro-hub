/**
 * Agent card component for displaying agent info
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Agent {
  id: string;
  name: string;
  email: string;
  mobile: string;
  assignedCount?: number;
  createdAt?: string;
}

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{agent.name}</span>
          {agent.assignedCount !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-normal">
              <Users className="h-3 w-3" />
              {agent.assignedCount}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="truncate">{agent.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{agent.mobile}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => navigate(`/agents/${agent.id}`)}
        >
          View Assigned List
        </Button>
      </CardContent>
    </Card>
  );
}
