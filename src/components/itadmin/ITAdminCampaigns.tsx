
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { requestService } from '@/services/requestService';
import { Plus, Eye, Calendar, Users, AlertCircle } from 'lucide-react';
import CampaignDetail from './CampaignDetail';

interface Campaign {
  id: string;
  name: string;
  description: string;
  application_id: string;
  application_name: string;
  application_ids?: string[]; // Support multiple applications
  due_date: string;
  assigned_managers: string[];
  status: 'active' | 'completed' | 'cancelled';
  users_to_review: number;
  progress: number;
  created_at: string;
}

export default function ITAdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    application_ids: [] as string[], // Changed from application_id to application_ids array
    due_date: '',
    assigned_manager: '', // Changed from assigned_managers array to single assigned_manager
    status: 'active' as 'active' | 'completed'
  });

  const managerOptions = [
    { id: 'manager_a', name: 'Manager A' },
    { id: 'manager_b', name: 'Manager B' },
    { id: 'manager_c', name: 'Manager C' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load campaigns and applications in parallel
      const [campaignsData, applicationsData] = await Promise.all([
        requestService.getCampaigns(),
        requestService.getApplications()
      ]);

      setCampaigns(campaignsData);
      setApplications(applicationsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      if (!formData.name || formData.application_ids.length === 0 || !formData.due_date || !formData.assigned_manager) {
        setError('Mohon isi semua field yang diperlukan');
        return;
      }

      // Check if campaigns can be created (3-month rule) for all selected applications
      for (const appId of formData.application_ids) {
        const canCreate = await requestService.canCreateCampaign(appId);
        if (!canCreate) {
          const appName = applications.find(app => app.id === appId)?.name || 'Unknown';
          setError(`Campaign untuk aplikasi "${appName}" sudah dibuat dalam 3 bulan terakhir`);
          return;
        }
      }

      // Create ONE campaign for multiple applications
      const selectedAppNames = formData.application_ids.map(appId => 
        applications.find(app => app.id === appId)?.name
      ).filter(Boolean);
      
      const campaignData = {
        name: formData.name,
        description: `${formData.description}\n\nAplikasi yang diaudit: ${selectedAppNames.join(', ')}`,
        application_id: formData.application_ids[0], // Use first app as primary for backend compatibility
        due_date: formData.due_date,
        assigned_managers: [formData.assigned_manager], // Store as single manager
        status: formData.status,
        // Add additional field to store multiple application IDs
        application_ids: formData.application_ids
      };

      const newCampaign = await requestService.createCampaign(campaignData);
      
      // Add users to campaign for ALL selected applications (but prevent duplication)
      for (const appId of formData.application_ids) {
        try {
          await requestService.addUsersToCampaign(newCampaign.id, appId);
          console.log(`✅ Users added to campaign for ${applications.find(app => app.id === appId)?.name}`);
        } catch (userError) {
          console.warn(`Could not add users to campaign for ${applications.find(app => app.id === appId)?.name}:`, userError);
        }
      }

      // Reset form and reload data
      setFormData({
        name: '',
        description: '',
        application_ids: [],
        due_date: '',
        assigned_manager: '',
        status: 'active'
      });
      setShowCreateForm(false);
      await loadData();

      console.log(`✅ Created 1 campaign for ${formData.application_ids.length} applications successfully`);

    } catch (err) {
      console.error('Error creating campaign:', err);
      setError('Gagal membuat campaign');
    }
  };

  const handleManagerToggle = (managerId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_manager: managerId
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Aktif</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-500">Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCampaign(null);
  };

  if (viewMode === 'detail' && selectedCampaign) {
    return (
      <CampaignDetail 
        campaignId={selectedCampaign.id} 
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Campaign Management</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Buat Campaign
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaign Management</h1>
          <p className="text-gray-600">Kelola audit campaign untuk evaluasi akses user</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Buat Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat Campaign Baru</DialogTitle>
              <DialogDescription>
                Buat campaign audit untuk mengevaluasi akses user ke aplikasi tertentu.
                Campaign hanya bisa dibuat sekali dalam 3 bulan untuk aplikasi yang sama.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Campaign *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: AWS Users Audit Q1 2024"
                />
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Jelaskan tujuan dan scope audit campaign ini"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="application">Aplikasi untuk Audit *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={app.id}
                        checked={formData.application_ids.includes(app.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              application_ids: [...prev.application_ids, app.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              application_ids: prev.application_ids.filter(id => id !== app.id)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={app.id} className="text-sm cursor-pointer">
                        {app.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.application_ids.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Pilih minimal 1 aplikasi untuk audit</p>
                )}
              </div>

              <div>
                <Label htmlFor="due_date">Tanggal Selesai *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="assigned_manager">Manager yang Ditugaskan *</Label>
                <Select onValueChange={(value) => handleManagerToggle(value)} value={formData.assigned_manager}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managerOptions.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateCampaign}>
                  Buat Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada Campaign</h3>
            <p className="text-gray-500 mb-4">
              Buat campaign pertama untuk memulai audit akses user
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Buat Campaign Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {campaign.name}
                      {getStatusBadge(campaign.status)}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {campaign.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCampaign(campaign)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat Detail
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Aplikasi</p>
                      <p className="font-medium">{campaign.application_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium">{formatDate(campaign.due_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total User</p>
                      <p className="font-medium">{campaign.users_to_review} user</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 text-gray-500">📊</div>
                    <div>
                      <p className="text-sm text-gray-500">Progress</p>
                      <p className="font-medium">{campaign.progress}%</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress Review</span>
                    <span>{campaign.progress}%</span>
                  </div>
                  <Progress value={campaign.progress} className="w-full" />
                </div>

                {/* Assigned Managers */}
                {campaign.assigned_managers && campaign.assigned_managers.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Manager yang Ditugaskan:</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.assigned_managers.map((manager, index) => (
                        <Badge key={index} variant="outline">{manager}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
