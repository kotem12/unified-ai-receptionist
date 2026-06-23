'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import DashboardNav from '@/components/DashboardNav'

export default function CalendarPage() {
  const [appointments, setAppointments] =
    useState<any[]>([])

  const [customerName, setCustomerName] =
    useState('')

  const [customerPhone, setCustomerPhone] =
    useState('')

  const [appointmentDate, setAppointmentDate] =
    useState('')

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    const supabase =
      getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: business } =
      await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!business) return

    const { data } =
      await (supabase as any)
        .from('appointments')
        .select('*')
        .eq('business_id', business.id)
        .order(
          'appointment_datetime',
          { ascending: true }
        )

    setAppointments(data || [])
  }

  async function createAppointment() {

    if (
      !customerName ||
      !customerPhone ||
      !appointmentDate
    ) {
      alert('Fill all fields')
      return
    }
    
    const supabase =
      getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: business } =
      await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

    await (supabase as any)
      .from('appointments')
      .insert({
        business_id: business.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        appointment_datetime:
          appointmentDate,
        status: 'scheduled'
      })

    setCustomerName('')
    setCustomerPhone('')
    setAppointmentDate('')

    loadAppointments()
  }

  async function updateAppointmentStatus(
    appointmentId: string,
    status: string
  ) {
    const supabase =
      getSupabaseBrowser()

    await (supabase as any)
      .from('appointments')
      .update({
        status,
      })
      .eq('id', appointmentId)

    loadAppointments()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Appointments</h1>

      <DashboardNav />

    <div
      style={{
        border: '1px solid #ddd',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
      }}
    >
      <h3>Create Appointment</h3>

      <input
        value={customerName}
        onChange={(e) =>
          setCustomerName(e.target.value)
        }
        placeholder="Customer Name"
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 10,
        }}
      />

      <input
        value={customerPhone}
        onChange={(e) =>
          setCustomerPhone(e.target.value)
        }
        placeholder="Customer Phone"
        style={{
          width: '100%',
          padding:10,
          marginBottom: 10,
        }}
      />

      <input
        type="datetime-local"
        value={appointmentDate}
        onChange={(e) =>
          setAppointmentDate(e.target.value)
        }
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 10,
        }}
      />

      <button
        onClick={createAppointment}
      >
        Create Appointment
      </button>
    </div>

      {appointments.map((a) => (
        <div
          key={a.id}
          style={{
            border: '1px solid #ddd',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <h3>
            {a.customer_name || 'Unknown'}
          </h3>

          <p>
            {a.customer_phone}
          </p>

          <p>
            {new Date(
              a.appointment_datetime
            ).toLocaleString()}
          </p>

          <p>
            Status:
            {' '}
            {a.status}
          </p>

          <p>
            Assigned:
            {' '}
            {a.assigned_to || '-'}
          </p>

          <p>
            {a.notes || ''}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 10,
            }}
          >
            <button
              onClick={() =>
                updateAppointmentStatus(
                  a.id,
                  'completed'
                )
              }
            >
              Complete
            </button>

            <button
              onClick={() =>
                updateAppointmentStatus(
                  a.id,
                  'cancelled'
                )
              }
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
