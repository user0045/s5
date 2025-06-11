
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, Play, Heart, List, TrendingUp, Users, Clock, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsEvent {
  id: number;
  content_id: number | null;
  event_type: string;
  user_id: number | null;
  timestamp: string;
  metadata: any;
}

interface ContentAnalytics {
  contentId: number;
  title: string;
  views: number;
  plays: number;
  likes: number;
  addToList: number;
  totalEvents: number;
}

const AnalyticsDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  const { data: analytics = [] } = useQuery({
    queryKey: ['/api/analytics'],
    refetchInterval: 5000 // Refetch every 5 seconds for real-time updates
  });

  const createAnalyticsEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const { data, error } = await supabase
        .from('analytics')
        .insert({
          content_id: eventData.contentId,
          event_type: eventData.eventType,
          user_id: eventData.userId,
          metadata: eventData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    }
  });

  const processContentAnalytics = (events: AnalyticsEvent[]) => {
    const contentMap = new Map<number, ContentAnalytics>();

    events.forEach(event => {
      if (event.content_id) {
        if (!contentMap.has(event.content_id)) {
          contentMap.set(event.content_id, {
            contentId: event.content_id,
            title: `Content ${event.content_id}`,
            views: 0,
            plays: 0,
            likes: 0,
            addToList: 0,
            totalEvents: 0
          });
        }

        const content = contentMap.get(event.content_id)!;
        content.totalEvents++;

        switch (event.event_type) {
          case 'view':
            content.views++;
            break;
          case 'play':
            content.plays++;
            break;
          case 'like':
            content.likes++;
            break;
          case 'add_to_list':
            content.addToList++;
            break;
        }
      }
    });

    return Array.from(contentMap.values()).sort((a, b) => b.totalEvents - a.totalEvents);
  };

  const getFilteredAnalytics = () => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedTimeRange) {
      case '1h':
        startDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }

    return analytics.filter(event => new Date(event.timestamp) >= startDate);
  };

  const getEventTypeStats = () => {
    const filtered = getFilteredAnalytics();
    const stats = {
      view: 0,
      play: 0,
      like: 0,
      add_to_list: 0
    };

    filtered.forEach(event => {
      if (event.event_type in stats) {
        stats[event.event_type as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const getHourlyData = () => {
    const filtered = getFilteredAnalytics();
    const hourlyMap = new Map<string, number>();

    filtered.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      const hourKey = `${hour}:00`;
      hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + 1);
    });

    return Array.from(hourlyMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  };

  const stats = getEventTypeStats();
  const hourlyData = getHourlyData();
  const contentAnalytics = processContentAnalytics(analytics);
  const realTimeEvents = analytics.slice(0, 10);
  const totalEvents = Object.values(stats).reduce((sum, value) => sum + value, 0);

  const pieData = [
    { name: 'Views', value: stats.view, color: '#8884d8' },
    { name: 'Plays', value: stats.play, color: '#82ca9d' },
    { name: 'Likes', value: stats.like, color: '#ffc658' },
    { name: 'Add to List', value: stats.add_to_list, color: '#ff7300' }
  ];

  const simulateRealTimeEvent = async () => {
    const eventTypes = ['view', 'play', 'like', 'add_to_list'];
    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    createAnalyticsEventMutation.mutate({
      contentId: Math.floor(Math.random() * 10) + 1,
      eventType: randomEventType,
      userId: Math.floor(Math.random() * 100) + 1,
      metadata: { test: true, timestamp: new Date().toISOString() }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time content performance metrics</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={simulateRealTimeEvent} 
            variant="outline"
            disabled={createAnalyticsEventMutation.isPending}
          >
            {createAnalyticsEventMutation.isPending ? "Creating..." : "Simulate Event"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.view.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedTimeRange === '24h' ? 'Last 24 hours' : `Last ${selectedTimeRange}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Plays</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.play.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedTimeRange === '24h' ? 'Last 24 hours' : `Last ${selectedTimeRange}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.like.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedTimeRange === '24h' ? 'Last 24 hours' : `Last ${selectedTimeRange}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Added to List</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.add_to_list.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedTimeRange === '24h' ? 'Last 24 hours' : `Last ${selectedTimeRange}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Hourly event distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>Types of user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance and Real-time Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>Most engaging content by total interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentAnalytics.slice(0, 5).map((content, index) => (
                <div key={content.contentId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{content.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {content.totalEvents} total interactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-2 text-sm">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {content.views}
                      </span>
                      <span className="flex items-center">
                        <Play className="h-3 w-3 mr-1" />
                        {content.plays}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Real-time Events</span>
              <Badge variant="secondary" className="animate-pulse">LIVE</Badge>
            </CardTitle>
            <CardDescription>Latest user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {realTimeEvents.map((event, index) => (
                <div key={`${event.id}-${index}`} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={
                        event.event_type === 'view' ? 'default' :
                        event.event_type === 'play' ? 'secondary' :
                        event.event_type === 'like' ? 'destructive' : 'outline'
                      }
                    >
                      {event.event_type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        User {event.user_id || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Content ID: {event.content_id || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Overall platform metrics for {selectedTimeRange}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalEvents}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{contentAnalytics.length}</div>
              <div className="text-sm text-muted-foreground">Active Content</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.play > 0 ? ((stats.play / stats.view) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Play Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.view > 0 ? ((stats.like / stats.view) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Like Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
