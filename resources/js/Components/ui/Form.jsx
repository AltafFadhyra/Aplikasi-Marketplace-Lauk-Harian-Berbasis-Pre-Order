import { AlertCircle, Check, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState } from 'react';

const DASAR =
    'w-full rounded-2xl border bg-white px-4 text-sm text-navy-900 placeholder:text-navy-300 ' +
    'transition-all duration-200 outline-none ' +
    'focus:border-powder-400 focus:ring-4 focus:ring-powder-500/12 ' +
    'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-navy-300';

const Border = {
    netral: 'border-slate-200 hover:border-slate-300',
    powder: 'border-powder-200 bg-powder-50/40',
};

const Field = ({ label, galat, petunjuk, wajib, children, className = '', htmlFor }) => {
    return (
        <div className={['space-y-1.5', className].join(' ')}>
            {label ? (
                <label htmlFor={htmlFor} className="flex items-center gap-1 text-[13px] font-semibold text-navy-700">
                    {label}
                    {wajib ? <span className="text-danger-500">*</span> : null}
                </label>
            ) : null}
            {children}
            {galat ? (
                <p className="flex items-start gap-1.5 text-xs font-medium text-danger-500">
                    <AlertCircle className="mt-px size-3.5 shrink-0" />
                    {galat}
                </p>
            ) : petunjuk ? (
                <p className="text-xs text-navy-400">{petunjuk}</p>
            ) : null}
        </div>
    );
};

export const Input = forwardRef(function Input(
    { label, galat, petunjuk, wajib, ikon: Ikon,akhiran, className = '', containerClassName = '', warna = 'netral', tinggi = 'md', ...props },
    ref,
) {
    const id = useId();
    const [sembunyi, setSembunyi] = useState(true);
    const adalahSandi = props.type === 'password';

    return (
        <Field label={label} galat={galat} petunjuk={petunjuk} wajib={wajib} className={containerClassName} htmlFor={id}>
            <div className="relative">
                {Ikon ? (
                    <Ikon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-navy-300" strokeWidth={2} />
                ) : null}
                <input
                    ref={ref}
                    id={id}
                    aria-invalid={galat ? 'true' : 'false'}
                    className={[
                        DASAR,
                        Border[warna],
                        galat ? 'border-danger-500/70 focus:border-danger-500 focus:ring-danger-500/12' : '',
                        tinggi === 'sm' ? 'h-10' : 'h-12',
                        Ikon ? 'pl-11' : '',
                        adalahSandi || akhiran ? 'pr-11' : '',
                        className,
                    ].join(' ')}
                    {...props}
                />
                {adalahSandi ? (
                    <button
                        type="button"
                        onClick={() => setSembunyi((v) => !v)}
                        tabIndex={-1}
                        aria-label={sembunyi ? 'Tampilkan sandi' : 'Sembunyikan sandi'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-300 transition-colors hover:text-powder-500"
                    >
                        {sembunyi ? <Eye className="size-[18px]" /> : <EyeOff className="size-[18px]" />}
                    </button>
                ) : akhiran ? (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{akhiran}</span>
                ) : null}
            </div>
        </Field>
    );
});

export const Select = forwardRef(function Select(
    { label, galat, petunjuk, wajib, ikon: Ikon, children, className = '', containerClassName = '', warna = 'netral', ...props },
    ref,
) {
    const id = useId();

    return (
        <Field label={label} galat={galat} petunjuk={petunjuk} wajib={wajib} className={containerClassName} htmlFor={id}>
            <div className="relative">
                {Ikon ? (
                    <Ikon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-navy-300" strokeWidth={2} />
                ) : null}
                <select
                    ref={ref}
                    id={id}
                    aria-invalid={galat ? 'true' : 'false'}
                    className={[
                        DASAR,
                        Border[warna],
                        'appearance-none pr-10',
                        galat ? 'border-danger-500/70' : '',
                        Ikon ? 'pl-11' : 'pl-4',
                        className,
                    ].join(' ')}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
            </div>
        </Field>
    );
});

export const Textarea = forwardRef(function Textarea(
    { label, galat, petunjuk, wajib, baris = 3, className = '', containerClassName = '', ...props },
    ref,
) {
    const id = useId();

    return (
        <Field label={label} galat={galat} petunjuk={petunjuk} wajib={wajib} className={containerClassName} htmlFor={id}>
            <textarea
                ref={ref}
                id={id}
                rows={baris}
                aria-invalid={galat ? 'true' : 'false'}
                className={[DASAR, Border.netral, 'resize-y py-3 leading-relaxed', galat ? 'border-danger-500/70' : '', className].join(' ')}
                {...props}
            />
        </Field>
    );
});

export function Checkbox({ label, deskripsi, galat, checked, onChange, className = '', disabled = false }) {
    const id = useId();

    return (
        <div className={['flex items-start gap-3', className].join(' ')}>
            <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
                <input
                    id={id}
                    type="checkbox"
                    checked={Boolean(checked)}
                    onChange={onChange}
                    disabled={disabled}
                    className="peer size-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-powder-500 checked:bg-powder-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Check
                    className="pointer-events-none absolute size-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                    strokeWidth={3.5}
                />
            </span>
            <label htmlFor={id} className="cursor-pointer select-none">
                <span className="block text-[13px] font-medium text-navy-700">{label}</span>
                {deskripsi ? <span className="mt-0.5 block text-xs text-navy-400">{deskripsi}</span> : null}
            </label>
            {galat ? <p className="mt-1 text-xs font-medium text-danger-500">{galat}</p> : null}
        </div>
    );
}

export function Toggle({ checked, onChange, label, deskripsi, ikon: Ikon, className = '' }) {
    return (
        <div className={['flex items-center justify-between gap-4', className].join(' ')}>
            <div className="flex items-center gap-3">
                {Ikon ? (
                    <span className="grid size-9 place-items-center rounded-xl bg-powder-50 text-powder-600">
                        <Ikon className="size-4.5" strokeWidth={2.2} />
                    </span>
                ) : null}
                <div>
                    <p className="text-sm font-semibold text-navy-800">{label}</p>
                    {deskripsi ? <p className="text-xs text-navy-400">{deskripsi}</p> : null}
                </div>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={Boolean(checked)}
                onClick={() => onChange?.(!checked)}
                className={[
                    'relative h-7 w-12 shrink-0 rounded-full transition-all duration-300',
                    checked ? 'bg-powder-500 shadow-[0_0_0_4px_rgba(109,156,210,0.15)]' : 'bg-slate-300',
                ].join(' ')}
            >
                <span
                    className={[
                        'absolute top-1 size-5 rounded-full bg-white shadow-md transition-all duration-300',
                        checked ? 'left-6' : 'left-1',
                    ].join(' ')}
                />
            </button>
        </div>
    );
}

export { Field as FormField };
