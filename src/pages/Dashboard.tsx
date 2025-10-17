/**
 * Main dashboard page
 * Shows stats, agents list, and CSV upload/distribution functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, BarChart3, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { AgentCard, Agent } from '@/components/agents/AgentCard';
import { CSVUploader } from '@/components/csv/CSVUploader';
import { CSVPreview } from '@/components/csv/CSVPreview';
import { DistributionPreview } from '@/components/csv/DistributionPreview';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { CSVItem, distributeItems, DistributedItems } from '@/utils/distribute';
import { AgentForm } from '@/components/agents/AgentForm';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [csvData, setCSVData] = useState<CSVItem[]>([]);
  const [distributed, setDistributed] = useState<DistributedItems[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch agents
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const data = await api.get<Agent[]>('/api/agents');
      setAgents(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch agents',
      });
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleCSVDataParsed = (data: CSVItem[]) => {
    setCSVData(data);
    setDistributed([]);
  };

  const handleDistribute = async () => {
    if (csvData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data',
        description: 'Please upload a CSV file first',
      });
      return;
    }

    if (agents.length < 5) {
      toast({
        variant: 'destructive',
        title: 'Insufficient agents',
        description: 'You need at least 5 agents for distribution',
      });
      return;
    }

    setIsDistributing(true);

    try {
      // Use first 5 agents for distribution
      const agentIds = agents.slice(0, 5).map(a => a.id);
      const distributedData = distributeItems(csvData, agentIds);
      
      // Send to backend
      await api.post('/api/distribute', {
        items: csvData,
        agentIds,
      });

      setDistributed(distributedData);

      toast({
        title: 'Success',
        description: `Distributed ${csvData.length} items among ${agentIds.length} agents`,
      });

      // Refresh agents to update counts
      fetchAgents();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to distribute items',
      });
    } finally {
      setIsDistributing(false);
    }
  };

  const handleRedistribute = async () => {
    if (distributed.length === 0 || csvData.length === 0) return;
    await handleDistribute();
  };

  const handleCreateAgent = async (data: { name: string; email: string; mobile: string; password: string }) => {
    setIsCreatingAgent(true);
    try {
      await api.post('/api/agents', data);
      
      toast({
        title: 'Success',
        description: `Agent ${data.name} created successfully`,
      });

      setIsAddAgentOpen(false);
      fetchAgents();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create agent',
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const totalItems = csvData.length;
  const distributedCount = distributed.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage agents and distribute leads efficiently</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatCard
            title="Total Agents"
            value={agents.length}
            icon={Users}
            description={`${agents.filter(a => (a.assignedCount || 0) > 0).length} with assignments`}
          />
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={FileText}
            description={distributedCount > 0 ? `${distributedCount} distributed` : 'Upload CSV to start'}
          />
          <StatCard
            title="Distribution Status"
            value={distributedCount > 0 ? 'Complete' : 'Pending'}
            icon={BarChart3}
            description={distributedCount > 0 ? `Across ${distributed.length} agents` : 'No distribution yet'}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
              </DialogHeader>
              <AgentForm onSubmit={handleCreateAgent} isLoading={isCreatingAgent} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="upload">CSV Upload & Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-4">
            {isLoadingAgents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No agents yet. Add your first agent to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <CSVUploader onDataParsed={handleCSVDataParsed} />
              
              {csvData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDistribute}
                      disabled={isDistributing || agents.length < 5}
                      className="flex-1"
                    >
                      {isDistributing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Distribute to 5 Agents
                    </Button>
                    
                    {distributed.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleRedistribute}
                        disabled={isDistributing}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Redistribute
                      </Button>
                    )}
                  </div>

                  {agents.length < 5 && (
                    <p className="text-sm text-destructive">
                      You need at least 5 agents. Currently: {agents.length}
                    </p>
                  )}
                </div>
              )}
            </div>

            {csvData.length > 0 && (
              <CSVPreview data={csvData} />
            )}

            {distributed.length > 0 && (
              <DistributionPreview distributed={distributed} agents={agents} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
