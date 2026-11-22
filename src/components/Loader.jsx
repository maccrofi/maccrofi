// Loader – simple centered spinner shown while auth state loads.
export default function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-spinner" />
      <p>Loading…</p>
    </div>
  );
}
