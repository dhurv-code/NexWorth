export default function Card({ children, className = '' }) {
  return <section className={`glass rounded-xl p-5 ${className}`}>{children}</section>
}

