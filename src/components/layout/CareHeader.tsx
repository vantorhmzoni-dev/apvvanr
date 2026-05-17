export function CareHeader() {
  return (
    <>
      <header className="flex items-center justify-between border-b border-[#eee] bg-white px-5 py-[15px]">
        <div className="flex items-center gap-1.5 text-sm text-[#666]">
          <span aria-hidden>🌐</span>
          <span>EN</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-bold text-[#2c3e50]">Care</span>
          <span
            aria-hidden
            className="grid size-[35px] place-items-center rounded-full bg-[#2c3e50] font-bold leading-none text-white"
          >
            b
          </span>
        </div>
      </header>
      <div className="mx-auto my-2.5 h-[3px] w-[60px] bg-[#ff9500]" aria-hidden />
    </>
  )
}
