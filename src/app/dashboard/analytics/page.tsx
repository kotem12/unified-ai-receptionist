'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import DashboardNav from '@/components/DashboardNav'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    hotLeads: 0,
    appointments: 0,
    wonDeals: 0,
    lostDeals: 0,

    averageScore: 0,
    highestScore: 0,

    openTasks: 0,
    completedTasks: 0,

    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    const supabase = getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: business } = await (supabase as any)
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!business) return

    const currentBusiness = business as any

    const { data: leads } = await (supabase as any)
      .from('leads')
      .select('*')
      .eq('business_id', currentBusiness.id)

    const allLeads = (leads || []) as any[]

    const { data: tasks } = await (supabase as any)
      .from('follow_up_tasks')
      .select('*')
      .eq('business_id', currentBusiness.id)

    const { data: appointments } = await (supabase as any)
      .from('appointments')
      .select('*')
      .eq('business_id', currentBusiness.id)

    const allTasks = tasks || []
    const allAppointments = appointments || []

    const scores = allLeads
        .map((l: any) => l.score || 0)

    const averageScore =
      scores.length === 0
        ? 0
        : Math.round(
            scores.reduce(
                (a: number, b: number) => a + b,
                0
            ) / scores.length
        )

    const highestScore =
      scores.length === 0
        ? 0
        : Math.max(...scores)

    setStats({
        totalLeads: allLeads.length,

        newLeads: allLeads.filter(
            (l: any) => l.stage === 'new'
        ).length,

        qualifiedLeads: allLeads.filter(
            (l: any) => l.stage === 'qualified'
        ).length,

        hotLeads: allLeads.filter(
            (l: any) => l.stage === 'hot'
        ).length,

        appointments: allLeads.filter(
            (l: any) => l.stage === 'appointment'
        ).length,

        wonDeals: allLeads.filter(
            (l: any) => l.stage === 'won'
        ).length,

        lostDeals: allLeads.filter(
            (l: any) => l.stage === 'lost'
        ).length,

        averageScore,
        highestScore,

        openTasks: allTasks.filter(
            (t: any) => t.status === 'open'
        ).length,

        completedTasks: allTasks.filter(
            (t: any) => t.status === 'completed'
        ).length,

        scheduledAppointments: 
            allAppointments.filter(
                (a: any) => 
                    a.status === 'scheduled'
            ).length,

        completedAppointments: 
            allAppointments.filter(
                (a: any) => 
                    a.status === 'completed'
            ).length,

        cancelledAppointments: 
            allAppointments.filter(
                (a: any) => 
                    a.status === 'cancelled'
            ).length,
     })
  }

  const conversionRate =
    stats.totalLeads === 0
      ? 0
      : Math.round(
          (stats.wonDeals /
            stats.totalLeads) *
            100
        )

  return (
    <div style={{ padding: 20 }}>
      <h1>Analytics</h1>

      <DashboardNav />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(200px,1fr))',
          gap: 16,
          marginTop: 20,
        }}
      >
        <Metric
          title="Total Leads"
          value={stats.totalLeads}
        />

        <Metric
          title="New"
          value={stats.newLeads}
        />

        <Metric
          title="Qualified"
          value={stats.qualifiedLeads}
        />

        <Metric
          title="Hot"
          value={stats.hotLeads}
        />

        <Metric
          title="Appointments"
          value={stats.appointments}
        />

        <Metric
          title="Won"
          value={stats.wonDeals}
        />

        <Metric
          title="Lost"
          value={stats.lostDeals}
        />

        <Metric
          title="Conversion Rate"
          value={`${conversionRate}%`}
        />

        <Metric
          title="Average Lead Score"
          value={stats.averageScore}
        />

        <Metric
          title="Highest Lead Score"
          value={stats.highestScore}
        />

        <Metric
          title="Open Tasks"
          value={stats.openTasks}
        />

        <Metric
          title="Completed Tasks"
          value={stats.completedTasks}
        />

        <Metric
          title="Scheduled Appointments"
          value={stats.scheduledAppointments}
        />

        <Metric
          title="Completed Appointments"
          value={stats.completedAppointments}
        />

        <Metric
          title="Cancelled Appointments"
          value={stats.cancelledAppointments}
        />
      </div>

        <h2 style={{ marginTop: 40 }}>
            Conversion Funnel
        </h2>

        <div
            style={{
                display: 'grid',
                gridTemplateColumns:
                    'repeat(auto-fit,minmax(220px,1fr))',
                gap: 16,
                marginTop: 20,
            }}
        >
            <Metric
                title="New → Qualified"
                value={
                    stats.totalLeads === 0
                        ? '0%'
                        : `${Math.round(
                            (stats.qualifiedLeads / 
                                stats.totalLeads) * 
                                100
                        )}%`
                }
            />

            <Metric
                title="Qualified → Hot"
                value={
                    stats.qualifiedLeads === 0
                        ? '0%'
                        : `${Math.round(
                            (stats.hotLeads / 
                                stats.qualifiedLeads) * 
                                100
                        )}%`
                }
            />

            <Metric
                title="Hot → Appointment"
                value={
                    stats.hotLeads === 0
                        ? '0%'
                        : `${Math.round(
                            (stats.appointments / 
                                stats.hotLeads) * 
                                100
                        )}%`
                }
            />

            <Metric
                title="Appointment → Won"
                value={
                    stats.appointments === 0
                        ? '0%'
                        : `${Math.round(
                            (stats.wonDeals / 
                                stats.appointments) * 
                                100
                        )}%`
                }
            />
        </div>
    </div>
  )
}

function Metric({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div
      style={{
        background: 'white',
        padding: 20,
        borderRadius: 10,
        boxShadow:
          '0 2px 6px rgba(0,0,0,0.08)',
      }}
    >
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  )
}