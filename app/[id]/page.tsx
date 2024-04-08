import { createClient } from "@/utils/supabase/server";


export default async function ProtectedPage() {

	return (
		<div className="h-full w-full">
			<div className="h-full">THis is Dashboard</div>
		</div>
	);
}
