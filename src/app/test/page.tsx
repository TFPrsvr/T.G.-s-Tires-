export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white' }}>
      <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>Button Test Page</h1>

      {/* Basic HTML button */}
      <button style={{
        background: '#64748b',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        margin: '10px',
        cursor: 'pointer'
      }}>
        Basic HTML Button
      </button>

      {/* CSS class buttons */}
      <button className="btn-primary" style={{ margin: '10px' }}>
        CSS Primary Button
      </button>

      <button className="btn-gradient-primary" style={{ margin: '10px' }}>
        CSS Gradient Button
      </button>

      {/* Simple links */}
      <div style={{ margin: '20px 0' }}>
        <a href="/sign-in" style={{
          display: 'inline-block',
          background: '#64748b',
          color: 'white',
          padding: '10px 20px',
          textDecoration: 'none',
          borderRadius: '5px',
          margin: '10px'
        }}>
          Go to Sign In
        </a>

        <a href="/sign-up" style={{
          display: 'inline-block',
          background: '#059669',
          color: 'white',
          padding: '10px 20px',
          textDecoration: 'none',
          borderRadius: '5px',
          margin: '10px'
        }}>
          Go to Sign Up
        </a>
      </div>
    </div>
  );
}