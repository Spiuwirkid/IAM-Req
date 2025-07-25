import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requestService } from '@/services/requestService';
import { Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface CampaignUser {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  application_name: string;
  current_access_level: string;
  access_granted_date: string;
  is_active: boolean;
}

interface AuditResult {
  id: string;
  user_id: string;
  user_email: string;
  manager_name: string;
  decision: 'yes' | 'no';
  comments: string;
  reviewed_at: string;
}

interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
}

export default function CampaignDetail({ campaignId, onBack }: CampaignDetailProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [campaignUsers, setCampaignUsers] = useState<CampaignUser[]>([]);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaignData();
  }, [campaignId]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load campaign details
      const campaigns = await requestService.getCampaigns();
      const campaignData = campaigns.find(c => c.id === campaignId);
      
      if (!campaignData) {
        setError('Campaign tidak ditemukan');
        return;
      }

      setCampaign(campaignData);

      // Load campaign users
      const users = await requestService.getCampaignUsers(campaignId);
      setCampaignUsers(users);

      // Load audit results
      const results = await requestService.getAuditResults(campaignId);
      setAuditResults(results);

    } catch (err) {
      console.error('Error loading campaign data:', err);
      setError('Gagal memuat data campaign');
    } finally {
      setLoading(false);
    }
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

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'yes':
        return <Badge variant="default" className="bg-green-500 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Ya
        </Badge>;
      case 'no':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Tidak
        </Badge>;
      default:
        return <Badge variant="outline">Belum Direview</Badge>;
    }
  };

  const getProgressPercentage = () => {
    if (campaignUsers.length === 0) return 0;
    const reviewedCount = auditResults.length;
    return Math.round((reviewedCount / campaignUsers.length) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} size="sm">
            ← Kembali
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

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} size="sm">
            ← Kembali
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} size="sm">
            ← Kembali
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-600">
              <p>Campaign tidak ditemukan</p>
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} size="sm">
            ← Kembali
          </Button>
          <h1 className="text-2xl font-bold">Detail Campaign</h1>
        </div>
        {getStatusBadge(campaign.status)}
      </div>

      {/* Campaign Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {campaign.name}
          </CardTitle>
          <CardDescription>{campaign.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Aplikasi</p>
                <p className="font-medium">
                  {campaign.application_ids && campaign.application_ids.length > 1 
                    ? `${campaign.application_name} + ${campaign.application_ids.length - 1} lainnya`
                    : campaign.application_name
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{formatDate(campaign.due_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Total User</p>
                <p className="font-medium">{campaignUsers.length} user</p>
              </div>
            </div>
          </div>

          {/* Show all applications if multiple */}
          {campaign.application_ids && campaign.application_ids.length > 1 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Aplikasi yang Diaudit:</p>
              <div className="flex flex-wrap gap-2">
                {campaign.application_ids.map((appId, index) => (
                  <Badge key={index} variant="outline" className="bg-white">
                    {campaignUsers.find(user => user.application_id === appId)?.application_name || `App ${index + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress Review</span>
              <span>{getProgressPercentage()}% ({auditResults.length}/{campaignUsers.length})</span>
            </div>
            <Progress value={getProgressPercentage()} className="w-full" />
          </div>

          {/* Assigned Managers */}
          {campaign.assigned_managers && campaign.assigned_managers.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Manager yang Ditugaskan:</p>
              <div className="flex flex-wrap gap-2">
                {campaign.assigned_managers.map((manager: string, index: number) => (
                  <Badge key={index} variant="outline">{manager}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar User untuk Audit</CardTitle>
          <CardDescription>
            Daftar user yang memiliki akses ke aplikasi dan perlu direview oleh manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaignUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada user yang ditambahkan ke campaign ini</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Level Akses</TableHead>
                  <TableHead>Tanggal Akses</TableHead>
                  <TableHead>Status Review</TableHead>
                  <TableHead>Keputusan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignUsers.map((user) => {
                  const auditResult = auditResults.find(ar => ar.user_id === user.user_id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.user_name}</TableCell>
                      <TableCell>{user.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.current_access_level}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.access_granted_date)}</TableCell>
                      <TableCell>
                        {auditResult ? (
                          <Badge variant="default" className="bg-green-500">
                            Sudah Direview
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Belum Direview
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {auditResult ? (
                          <div className="space-y-1">
                            {getDecisionBadge(auditResult.decision)}
                            {auditResult.comments && (
                              <p className="text-xs text-gray-500 mt-1">
                                {auditResult.comments}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              oleh {auditResult.manager_name}
                            </p>
                          </div>
                        ) : (
                          <Badge variant="outline">Menunggu Review</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 