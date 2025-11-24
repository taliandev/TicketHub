import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'


interface Event {
  _id: string
  title: string
  date: string
  location: string
  description: string
  type: string
  capacity: number
  price: number
  img: string
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }
    if (loading) {
      fetchEvents()
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {events.map((event) => (
    <Card
      key={event._id}
      id={event._id}
      img={event.img}
      date={new Date(event.date).toLocaleDateString()}
      title={event.title}
      description={event.description}
      location={event.location}
    />
  ))}
      </div>
    </div>
  )
} 