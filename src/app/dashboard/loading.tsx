export default function DashboardLoading() {
  return (
    <div style={{ width: '100%', padding: '20px 0', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      {/* Title skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ width: '200px', height: '32px', background: 'var(--border-light)', borderRadius: 'var(--radius-sm)' }} />
        <div style={{ width: '120px', height: '36px', background: 'var(--border-light)', borderRadius: 'var(--radius-sm)' }} />
      </div>

      {/* Stats row skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: '110px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>

      {/* Main content skeleton */}
      <div style={{ height: '400px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }} />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />
    </div>
  );
}
