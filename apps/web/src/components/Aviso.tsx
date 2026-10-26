export function AvisoCarregando({ texto }: { texto: string }) {
  return (
    <p className="border border-linha bg-faixa p-4" role="status">
      {texto}
    </p>
  )
}

export function AvisoErro({ onTentarDeNovo }: { onTentarDeNovo: () => void }) {
  return (
    <div className="border border-dest bg-dest-clara p-4" role="alert">
      <p className="font-bold">Não foi possível carregar os dados agora.</p>
      <button
        type="button"
        onClick={onTentarDeNovo}
        className="mt-2 border border-pri bg-pri px-4 py-1.5 font-bold text-white hover:bg-pri-escura"
      >
        Tentar de novo
      </button>
    </div>
  )
}
