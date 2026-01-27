
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-bold mb-4">Not Found</h2>
            <p className="text-zinc-500 mb-4">Could not find requested resource</p>
            <Link href="/" className="text-emerald-500 hover:underline">
                Return Home
            </Link>
        </div>
    )
}
