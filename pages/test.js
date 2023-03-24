import { createClient } from "@supabase/supabase-js";

export default function MyPage() {
  async function getData() {
    // Connect to the Supabase database
    const supabaseUrl = "https://mnhpqpybfurtxpruvltx.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_CLIENT_API_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the testTable table for data
    const { data, error } = await supabase.from("modelsData").select("*");

    // Handle any errors and log the data
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  }

  return (
    <div>
      <button onClick={getData}>Get Data</button>
    </div>
  );
}
