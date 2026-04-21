import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_name, email, phone, address } = body;

    // 1. Split name into First and Last for HubSpot requirements
    const nameParts = customer_name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Lead';

    // 2. Send to HubSpot CRM
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          firstname: firstName,
          lastname: lastName,
          email: email,
          phone: phone,
          address: address,
          hs_lead_status: 'NEW',
          company: 'FloorFlow Online Estimate'
        },
      }),
    });

    const data = await response.json();

    // 3. Handle HubSpot API errors (e.g., contact already exists or invalid token)
    if (!response.ok) {
      console.error("HubSpot API Error Details:", data);
      return NextResponse.json(
        { error: data.message || 'HubSpot Sync Failed' }, 
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    // This console log satisfies ESLint @typescript-eslint/no-unused-vars
    console.error("Internal Server Error in HubSpot Route:", error);
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}