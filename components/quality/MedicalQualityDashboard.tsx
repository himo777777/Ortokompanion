'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  Info,
  RefreshCw,
  Search,
  Flag,
  User,
  ChevronRight,
} from 'lucide-react';
import { Alert as AlertType, AlertFilter, alertEngine } from '@/lib/alert-engine';
import { sourceMonitor } from '@/lib/source-monitor';
import { colors } from '@/lib/design-tokens';
import { logger } from '@/lib/logger';
import {
  VERIFIED_SOURCES,
  getSourcesNeedingReview,
  getRecentlyVerifiedSources,
} from '@/data/verified-sources';
import { SourceReference, VerificationStatus } from '@/types/verification';
import { ALL_QUESTIONS } from '@/data/questions';
import { UNIFIED_CLINICAL_CASES } from '@/data/unified-clinical-cases';

interface MedicalQualityDashboardProps {
  userId?: string;
  onReviewStart?: (contentId: string) => void;
  onAlertAction?: (alertId: string, action: 'acknowledge' | 'resolve' | 'assign') => void;
}

type TabType = 'overview' | 'alerts' | 'sources' | 'review-queue' | 'history';
type AlertFilterType = 'all' | 'critical' | 'swedish' | 'overdue' | 'unresolved';

export default function MedicalQualityDashboard({
  userId = 'current-user',
  onReviewStart,
  onAlertAction,
}: MedicalQualityDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [alertFilter, setAlertFilter] = useState<AlertFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState<Map<string, any>>(new Map());

  const sources = Object.values(VERIFIED_SOURCES);

  const loadAlerts = useCallback(() => {
    const filter: AlertFilter = {};

    switch (alertFilter) {
      case 'critical':
        filter.severity = ['critical'];
        break;
      case 'swedish':
        filter.type = ['swedish-source-updated'];
        break;
      case 'overdue':
        filter.resolved = false;
        break;
      case 'unresolved':
        filter.resolved = false;
        break;
    }

    const loadedAlerts = alertEngine.getAlerts(filter);
    setAlerts(loadedAlerts);
  }, [alertFilter]);

  const loadMonitoringStatus = useCallback(() => {
    const status = sourceMonitor.getMonitoringStatus();
    setMonitoringStatus(status);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAlerts();
    loadMonitoringStatus();
  }, [loadAlerts, loadMonitoringStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const report = await sourceMonitor.checkAllSources();
      logger.info('Monitor report received', { report });
      loadAlerts();
      loadMonitoringStatus();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    alertEngine.acknowledgeAlert(alertId, userId);
    onAlertAction?.(alertId, 'acknowledge');
    loadAlerts();
  };

  const handleResolveAlert = (alertId: string) => {
    alertEngine.resolveAlert(alertId, userId);
    onAlertAction?.(alertId, 'resolve');
    loadAlerts();
  };

  const handleAssignAlert = (alertId: string) => {
    alertEngine.assignAlert(alertId, userId);
    onAlertAction?.(alertId, 'assign');
    loadAlerts();
  };

  // Calculate source verification metrics
  const metrics = useMemo(() => {
    const total = sources.length;
    const verified = sources.filter((s) => s.verificationStatus === 'verified').length;
    const needsReview = sources.filter((s) => s.verificationStatus === 'needs-review').length;
    const outdated = sources.filter((s) => s.verificationStatus === 'outdated').length;

    const avgReliability =
      sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length;

    const now = new Date();
    const expiringSoon = sources.filter((s) => {
      if (!s.expirationDate) return false;
      const daysUntil = (s.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 30;
    }).length;

    const expired = sources.filter((s) => {
      if (!s.expirationDate) return false;
      return s.expirationDate < now;
    }).length;

    const alertStats = alertEngine.getAlertStats();

    return {
      totalSources: total,
      verified,
      needsReview,
      outdated,
      avgReliability: Math.round(avgReliability),
      expiringSoon,
      expired,
      verificationRate: Math.round((verified / total) * 100),
      ...alertStats,
      acknowledgedToday: alerts.filter(
        (a) =>
          a.acknowledgedAt &&
          a.acknowledgedAt.toDateString() === new Date().toDateString()
      ).length,
      resolvedToday: alerts.filter(
        (a) =>
          a.resolvedAt &&
          a.resolvedAt.toDateString() === new Date().toDateString()
      ).length,
    };
  }, [sources, alerts]);

  // Filter alerts based on search
  const filteredAlerts = useMemo(() => {
    if (!searchQuery) return alerts;

    const query = searchQuery.toLowerCase();
    return alerts.filter(
      (alert) =>
        alert.title.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.affectedContent.some((c) => c.toLowerCase().includes(query))
    );
  }, [alerts, searchQuery]);

  const sourcesByType = useMemo(() => {
    const types: Record<string, number> = {};
    sources.forEach((s) => {
      types[s.type] = (types[s.type] || 0) + 1;
    });
    return types;
  }, [sources]);

  const recentlyVerified = getRecentlyVerifiedSources(30);
  const sourcesNeedingReview = getSourcesNeedingReview();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Verifierade Källor"
          value={metrics.verified}
          total={metrics.totalSources}
          color={colors.success[600]}
          bgColor={colors.success[50]}
        />
        <MetricCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="Kritiska Varningar"
          value={metrics.bySeverity.critical}
          color={colors.error[600]}
          bgColor={colors.error[50]}
        />
        <MetricCard
          icon={<Flag className="w-6 h-6" />}
          label="Svenska Källuppdateringar"
          value={metrics.swedishSourceAlerts}
          color={colors.primary[600]}
          bgColor={colors.primary[50]}
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Verifieringsgrad"
          value={`${metrics.verificationRate}%`}
          color={colors.success[600]}
          bgColor={colors.success[50]}
        />
      </div>

      {/* Alerts/Warnings */}
      {(metrics.expired > 0 || metrics.expiringSoon > 0 || metrics.bySeverity.critical > 0) && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Varningar som kräver åtgärd</h2>
          <div className="space-y-2">
            {metrics.expired > 0 && (
              <AlertBanner
                type="critical"
                icon={<XCircle className="w-5 h-5" />}
                message={`${metrics.expired} källor har passerat utgångsdatum och behöver omedelbar uppdatering`}
              />
            )}
            {metrics.expiringSoon > 0 && (
              <AlertBanner
                type="warning"
                icon={<AlertTriangle className="w-5 h-5" />}
                message={`${metrics.expiringSoon} källor går ut inom 30 dagar`}
              />
            )}
            {metrics.bySeverity.critical > 0 && (
              <AlertBanner
                type="critical"
                icon={<AlertCircle className="w-5 h-5" />}
                message={`${metrics.bySeverity.critical} kritiska varningar kräver omedelbar åtgärd`}
              />
            )}
          </div>
        </div>
      )}

      {/* Recent Critical Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Senaste kritiska varningar
        </h3>
        <div className="space-y-3">
          {filteredAlerts
            .filter((a) => a.severity === 'critical' && !a.resolved)
            .slice(0, 5)
            .map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100"
                onClick={() => setSelectedAlert(alert)}
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Skapad: {alert.createdAt.toLocaleDateString('sv-SE')}</span>
                    {alert.dueDate && (
                      <span>Deadline: {alert.dueDate.toLocaleDateString('sv-SE')}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          {filteredAlerts.filter((a) => a.severity === 'critical' && !a.resolved).length === 0 && (
            <p className="text-center text-gray-500 py-4">Inga kritiska varningar</p>
          )}
        </div>
      </div>

      {/* Source Types & Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Källor per Typ</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(sourcesByType).slice(0, 6).map(([type, count]) => (
              <div
                key={type}
                className="p-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {type.replace(/-/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Monitoring */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Källövervakning</h3>
            <button
              onClick={handleRefresh}
              className={`p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${
                refreshing ? 'animate-spin' : ''
              }`}
              disabled={refreshing}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {Array.from(monitoringStatus.entries())
              .slice(0, 6)
              .map(([sourceId, status]) => (
                <div key={sourceId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status.enabled ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {sourceId.replace(/-\d{4}$/, '')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {status.lastCheck
                      ? `${new Date(status.lastCheck).toLocaleDateString('sv-SE')}`
                      : 'Aldrig'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {/* Alert Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök varningar..."
                className="w-full pl-10 pr-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'critical', 'swedish', 'overdue', 'unresolved'] as AlertFilterType[]).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setAlertFilter(filter);
                    loadAlerts();
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    alertFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all'
                    ? 'Alla'
                    : filter === 'critical'
                    ? 'Kritiska'
                    : filter === 'swedish'
                    ? 'Svenska'
                    : filter === 'overdue'
                    ? 'Försenade'
                    : 'Olösta'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Inga varningar matchade dina filter</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  alert.severity === 'critical'
                    ? 'bg-red-100'
                    : alert.severity === 'high'
                    ? 'bg-orange-100'
                    : alert.severity === 'medium'
                    ? 'bg-yellow-100'
                    : 'bg-gray-100'
                }`}>
                  {alert.severity === 'critical' ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : alert.severity === 'high' ? (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Info className="w-5 h-5 text-yellow-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.acknowledged && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          Bekräftad
                        </span>
                      )}
                      {alert.resolved && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Löst
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-500">
                      Skapad: {alert.createdAt.toLocaleDateString('sv-SE')}
                    </span>
                    {alert.dueDate && (
                      <span className="text-xs text-gray-500">
                        Deadline: {alert.dueDate.toLocaleDateString('sv-SE')}
                      </span>
                    )}
                    {alert.assignedTo && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {alert.assignedTo}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    {!alert.acknowledged && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledgeAlert(alert.id);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Bekräfta
                      </button>
                    )}
                    {!alert.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolveAlert(alert.id);
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Markera som löst
                      </button>
                    )}
                    {!alert.assignedTo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignAlert(alert.id);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Ta ansvar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSources = () => (
    <div className="space-y-4">
      {/* Sources requiring action */}
      {sourcesNeedingReview.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Kräver åtgärd</h3>
          <div className="space-y-2">
            {sourcesNeedingReview.map((source) => (
              <SourceCard key={source.id} source={source} detailed showAlert />
            ))}
          </div>
        </div>
      )}

      {/* All sources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Alla källor ({sources.length})</h3>
        <div className="space-y-2">
          {sources.slice(0, 20).map((source) => (
            <SourceCard key={source.id} source={source} detailed />
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviewQueue = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Granskningskö</h3>
      <p className="text-gray-600">
        Innehåll som väntar på medicinsk granskning visas här.
      </p>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Historik</h3>
      <p className="text-gray-600">Visa tidigare granskningar och uppdateringar.</p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-lg bg-blue-100">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Medicinsk Kvalitet & Granskning
            </h1>
            <p className="text-gray-600">
              100% verifierad och uppdaterad medicinsk information
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Översikt', icon: TrendingUp },
            { id: 'alerts', label: 'Varningar', icon: AlertCircle },
            { id: 'sources', label: 'Källor', icon: Shield },
            { id: 'review-queue', label: 'Granskningskö', icon: FileText },
            { id: 'history', label: 'Historik', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'sources' && renderSources()}
        {activeTab === 'review-queue' && renderReviewQueue()}
        {activeTab === 'history' && renderHistory()}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Varningsdetaljer</h2>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Titel</h3>
                <p className="text-gray-900">{selectedAlert.title}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-1">Beskrivning</h3>
                <p className="text-gray-900">{selectedAlert.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-1">Åtgärd krävs</h3>
                <p className="text-gray-900">{selectedAlert.actionRequired}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Allvarlighetsgrad</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    selectedAlert.severity === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : selectedAlert.severity === 'high'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedAlert.severity}
                  </span>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Typ</h3>
                  <p className="text-gray-900">{selectedAlert.type}</p>
                </div>
              </div>

              {selectedAlert.affectedContent.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Påverkat innehåll ({selectedAlert.affectedContent.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedAlert.affectedContent.map((contentId) => {
                      // Try to find question
                      const question = ALL_QUESTIONS.find(q => q.id === contentId);
                      if (question) {
                        return (
                          <div
                            key={contentId}
                            className="p-3 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-xs font-medium text-blue-900">
                                    Fråga
                                  </span>
                                  <span className="text-xs text-blue-700">
                                    {question.domain}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900 line-clamp-2">
                                  {question.question}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  ID: {contentId}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Try to find case
                      const clinicalCase = UNIFIED_CLINICAL_CASES.find(c => c.id === contentId);
                      if (clinicalCase) {
                        return (
                          <div
                            key={contentId}
                            className="p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100 cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-medium text-green-900">
                                    Fallstudie
                                  </span>
                                  <span className="text-xs text-green-700">
                                    {clinicalCase.domain}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  {clinicalCase.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  ID: {contentId}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Fallback for unknown content
                      return (
                        <div
                          key={contentId}
                          className="p-2 bg-gray-100 rounded text-xs text-gray-700"
                        >
                          {contentId}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                {!selectedAlert.acknowledged && (
                  <button
                    onClick={() => {
                      handleAcknowledgeAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Bekräfta
                  </button>
                )}
                {!selectedAlert.resolved && (
                  <button
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Markera som löst
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Stäng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components

function MetricCard({
  icon,
  label,
  value,
  total,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  total?: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: bgColor }}>
          {React.cloneElement(icon as React.ReactElement, { style: { color } })}
        </div>
        {total && (
          <span className="text-xs text-gray-500">
            av {total}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
      </div>
      <div className="text-sm text-gray-600">
        {label}
      </div>
    </div>
  );
}

function AlertBanner({
  type,
  icon,
  message,
}: {
  type: 'critical' | 'warning' | 'info';
  icon: React.ReactNode;
  message: string;
}) {
  const config = {
    critical: {
      bg: colors.error[50],
      border: colors.error[200],
      icon: colors.error[600],
      text: colors.error[900],
    },
    warning: {
      bg: colors.warning[50],
      border: colors.warning[200],
      icon: colors.warning[600],
      text: colors.warning[900],
    },
    info: {
      bg: colors.primary[50],
      border: colors.primary[200],
      icon: colors.primary[600],
      text: colors.primary[900],
    },
  };

  const style = config[type];

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-lg"
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
      }}
    >
      {React.cloneElement(icon as React.ReactElement, { style: { color: style.icon } })}
      <span className="text-sm font-medium" style={{ color: style.text }}>
        {message}
      </span>
    </div>
  );
}

function SourceCard({
  source,
  detailed = false,
  showAlert = false,
}: {
  source: SourceReference;
  detailed?: boolean;
  showAlert?: boolean;
}) {
  const statusConfig: Record<VerificationStatus, { color: string; bg: string; label: string }> = {
    verified: {
      color: colors.success[600],
      bg: colors.success[50],
      label: 'Verifierad',
    },
    pending: {
      color: colors.warning[600],
      bg: colors.warning[50],
      label: 'Väntar',
    },
    'needs-review': {
      color: colors.warning[600],
      bg: colors.warning[50],
      label: 'Behöver Granskning',
    },
    outdated: {
      color: colors.error[600],
      bg: colors.error[50],
      label: 'Föråldrad',
    },
    deprecated: {
      color: colors.error[600],
      bg: colors.error[50],
      label: 'Utgången',
    },
  };

  const status = statusConfig[source.verificationStatus];

  const isExpired = source.expirationDate && source.expirationDate < new Date();
  const expiresVerySoon =
    source.expirationDate &&
    (source.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30;

  return (
    <div
      className="p-4 rounded-lg border bg-white"
      style={{
        borderColor: showAlert && isExpired ? colors.error[300] : colors.border.light,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold truncate text-gray-900">
              {source.title}
            </h4>
            <span
              className="px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap"
              style={{
                background: status.bg,
                color: status.color,
              }}
            >
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            <span>{source.author}</span>
            <span>•</span>
            <span>{source.year}</span>
            {source.edition && (
              <>
                <span>•</span>
                <span>{source.edition} upplaga</span>
              </>
            )}
            <span>•</span>
            <span className="capitalize">{source.type.replace(/-/g, ' ')}</span>
          </div>

          {detailed && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-full bg-gray-200 rounded-full h-2"
                    style={{ width: '100px' }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${source.reliability}%`,
                        background: source.reliability >= 90 ? colors.success[500] : source.reliability >= 70 ? colors.warning[500] : colors.error[500],
                      }}
                    />
                  </div>
                  <span className="text-gray-600">
                    {source.reliability}% tillförlitlighet
                  </span>
                </div>
                {source.evidenceLevel && (
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: colors.primary[100],
                      color: colors.primary[700],
                    }}
                  >
                    Evidens: {source.evidenceLevel}
                  </span>
                )}
              </div>

              {source.expirationDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" style={{ color: isExpired ? colors.error[600] : expiresVerySoon ? colors.warning[600] : colors.text.tertiary }} />
                  <span style={{ color: isExpired ? colors.error[600] : expiresVerySoon ? colors.warning[600] : colors.text.secondary }}>
                    {isExpired ? 'Utgången: ' : 'Går ut: '}
                    {source.expirationDate.toLocaleDateString('sv-SE')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                Senast verifierad: {source.lastVerified.toLocaleDateString('sv-SE')}
                {source.verifiedBy && ` av ${source.verifiedBy}`}
              </div>
            </div>
          )}
        </div>

        {showAlert && (isExpired || expiresVerySoon) && (
          <AlertCircle
            className="w-5 h-5 flex-shrink-0"
            style={{ color: isExpired ? colors.error[600] : colors.warning[600] }}
          />
        )}
      </div>
    </div>
  );
}
