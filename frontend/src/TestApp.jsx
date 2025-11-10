import { useState } from 'react'

export default function TestApp() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Build a portfolio website in 2 weeks' }
          ]
        })
      })
      
      const data = await response.json()
      setResult(data)
      alert('SUCCESS! Check the page for results.')
    } catch (error) {
      alert('ERROR: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>API Test</h1>
      <button 
        onClick={testAPI}
        disabled={loading}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          background: loading ? '#ccc' : '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Test Generate Plan'}
      </button>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h2>Result:</h2>
          <p><strong>Project:</strong> {result.project_name}</p>
          <p><strong>Duration:</strong> {result.total_duration} days</p>
          <p><strong>Tasks:</strong> {result.tasks.length}</p>
          <ul>
            {result.tasks.map(task => (
              <li key={task.id}>
                {task.name} - {task.owner} ({task.duration} days)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
