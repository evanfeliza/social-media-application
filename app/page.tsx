import DarkModeToggle from "@/components/libs/dark-mode-toggle";
import Link from "next/link";

export default async function Index() {

    return (
        <div className="relative hero min-h-screen bg-base-200">
            <div className="absolute top-3 left-3">
                <DarkModeToggle />
            </div>
            <div className="hero-content text-center">
                <div className="max-w-lg">
                    <h1 className="text-7xl font-bold tracking-wider"><span className="text-primary">Connect</span>opia</h1>
                    <p className="py-6 text-lg">Where Connections Flourish. Join now for authentic <span className="text-secondary">interactions</span> and <span className="text-secondary">vibrant</span> communities</p>
                    <Link href="/auth/callback">
                        <button className="btn btn-primary uppercase" >Join Now <i className="fi fi-rs-earth-americas"></i></button></Link>
                </div>
            </div>
        </div>
    );
}
