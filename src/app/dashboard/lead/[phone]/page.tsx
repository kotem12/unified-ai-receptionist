'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function LeadDetailsPage() {
  const params = useParams()

  const phone = decodeURIComponent(
    params.phone as string
  )

  const [lead, setLead] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [stage, setStage] = useState('')

  useEffect(() => {
    loadLead()
  }, [])

  async function loadLead() {
    const supabase = getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!business) return

    const currentBusiness = business as any

    const { data: leadData } = await (supabase as any)
      .from('leads')
      .select('*')
      .eq('customer_phone', phone)
      .eq('business_id', currentBusiness.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setLead(leadData)

    if (leadData) {
      setStage(leadData.stage || 'new')
    }

    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_phone', phone)
      .eq('business_id', currentBusiness.id)
      .order('created_at', { ascending: true })

    setMessages(conversations || [])

    const { data: appts } = await supabase
      .from('appointments')
      .select('*')
      .eq('customer_phone', phone)
      .eq('business_id', currentBusiness.id)
      .order('appointment_datetime', {
        ascending: true,
      })

    setAppointments(appts || [])

    const { data: taskData } = await (supabase as any)
      .from('follow_up_tasks')
      .select('*')
      .eq('lead_id', leadData.id)
      .order('created_at', { 
        ascending: false, })

    setTasks(taskData || [])
  }

  async function scheduleAppointment() {
    if (!appointmentDate) {
      alert('Select appointment date')
      return
    }

    const supabase = getSupabaseBrowser()

    const { error } = await (supabase as any)
      .from('appointments')
      .insert({
        customer_phone: phone,
        business_id: lead.business_id,
        appointment_datetime: appointmentDate,
        status: 'scheduled',
      })

    console.log(error)

    if (!error) {
      await updateStage('appointment')

      alert('Appointment scheduled')
      loadLead()

      setAppointmentDate('')
    }
  }

  async function updateStage(
    newStage: string
  ) {
    if (!lead) return

    const supabase = getSupabaseBrowser()

    const { error } = await (supabase as any)
      .from('leads')
      .update({
        stage: newStage,
      })
      .eq('id', lead.id)

    console.log('Stage update:', error)

    if (!error) {
      setStage(newStage)

      setLead({
        ...lead,
        stage: newStage,
      })
    }
  }

  async function createTask() {
    if (!newTask.trim()) {
      alert('Enter task description')
      return
    }

    const supabase = getSupabaseBrowser()

    const { error } = await (supabase as any)
      .from('follow_up_tasks')
      .insert({
        business_id: lead.business_id,
        lead_id: lead.id,
        task: newTask,
        due_date: taskDueDate || null,
      })

    console.log(error)

    if (!error) {
      setNewTask('')
      setTaskDueDate('')
      loadLead()
    }
  }

  if (!lead) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Lead Details</h1>
        <p>Lead not found.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Lead Details</h1>

      <div style={card}>
        <h2>{phone}</h2>

        <div style={{ marginTop: 12 }}>
          <label>
            <strong>Pipeline Stage</strong>
          </label>

          <br />

          <select
            value={stage}
            onChange={(e) => {
              const value = e.target.value

              setStage(value)

              updateStage(value)
            }}
            style={{
              padding: 10,
              borderRadius: 8,
              marginTop: 6,
              width: 220,
            }}
          >
            <option value="new">
              New
            </option>

            <option value="qualified">
              Qualified
            </option>

            <option value="hot">
              Hot
            </option>

            <option value="appointment">
              Appointment Set
            </option>

            <option value="lost">
              Lost
            </option>

            <option value="won">
              Won
            </option>
          </select>
        </div>

        <p>Intent: {lead.intent}</p>
        <p>Budget: {lead.budget || '-'}</p>
        <p>Timeline: {lead.timeline || '-'}</p>
        <p>Urgency: {lead.urgency}</p>
        <p>Stage: {lead.stage}</p>
        <p>Score: {lead.score}</p>

        <p>
          Locations:
          {' '}
          {lead.locations?.join(', ') || '-'}
        </p>
      </div>

      <h2>Conversation History</h2>

      {messages.map((msg) => (
        <div key={msg.id} style={card}>
          <p>
            <strong>Customer:</strong>
            {' '}
            {msg.customer_message}
          </p>

          <p>
            <strong>AI:</strong>
            {' '}
            {msg.ai_response}
          </p>

          <small>
            {new Date(
              msg.created_at
            ).toLocaleString()}
          </small>
        </div>
      ))}

      <div style={card}>
        <h2>Schedule Appointment</h2>

        <input
          type="datetime-local"
          value={appointmentDate}
          onChange={(e) =>
            setAppointmentDate(e.target.value)
          }
          style={{
            padding: 10,
            width: '100%',
            marginBottom: 10,
          }}
        />

        <button
          onClick={scheduleAppointment}
          style={{
            padding: 10,
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Schedule Appointment
        </button>
      </div>

      <h2>Appointments</h2>

      <div style={card}>
        <h2>Create Follow-up Task</h2>

        <input
          type="text"
          placeholder="Call customer tomorrow..."
          value={newTask}
          onChange={(e) =>
            setNewTask(e.target.value)
          }
          style={{
            padding: 10,
            width: '100%',
            marginBottom: 10,
          }}
        />

        <input
          type="datetime-local"
          value={taskDueDate}
          onChange={(e) =>
            setTaskDueDate(e.target.value)
          }
          style={{
            padding: 10,
            width: '100%',
            marginBottom: 10,
          }}
        />

        <button
          onClick={createTask}
          style={{
            padding: 10,
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Create Task
        </button>
      </div>

      <h2>Task List</h2>

      {tasks.length === 0 && (
        <p>No follow-up tasks</p>
      )}

      {tasks.map((task) => (
        <div key={task.id} style={card}>
          <p>
            <strong>
              {task.completed ? '✅' : '🕒'} {task.task}
            </strong>
            {' '}
            {task.task}
          </p>

          {task.due_date && (
            <p>
              Due:
              {' '}
              {new Date(
                task.due_date
              ).toLocaleString()}
            </p>
          )}

          <button
            onClick={async () => {
              const supabase = 
                getSupabaseBrowser()

              await (supabase as any)
                .from('follow_up_tasks')
                .update({
                  completed: !task.completed,
                })
                .eq('id', task.id)

              loadLead()
            }}
          >
            {task.completed
              ? 'Mark as Incomplete'
              : 'Mark as Completed'}
          </button>
        </div>
      ))}

      {appointments.length === 0 && (
        <p>No appointments</p>
      )}

      {appointments.map((appt) => (
        <div key={appt.id} style={card}>
          <p>
            {new Date(
              appt.appointment_datetime
            ).toLocaleString()}
          </p>

          <select
            value={appt.status}
            onChange={async (e) => {
              const supabase = getSupabaseBrowser()

              await (supabase as any)
                .from('appointments')
                .update({ 
                  status: e.target.value,
                })
                .eq('id', appt.id)

              loadLead()
            }}
          >
            <option value="scheduled">
              Scheduled
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="canceled">
              Cancelled
            </option>
          </select>
        </div>
      ))}
    </div>
  )
}

const card = {
  border: '1px solid #ddd',
  borderRadius: 10,
  padding: 16,
  marginBottom: 12,
}
