import Twilio from 'twilio';
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from '$env/static/private';

// POST route to send a text message
// request body:
//     name: string
//     phoneNumber: number
//     location: string
// returns:
//     nothing
export const POST: RequestHandler = async ({ request }) => {
    const { name, phoneNumber, location } = await request.json();

    const twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    try {
        await twilioClient.messages.create({
            body: `${name}'s Dash has detected a crash at ${location}. Please contact them immediately or send help.`,
            to: phoneNumber
        });
    } catch (e) {
        return error(500, e.message);
    }

    return json({});
};
