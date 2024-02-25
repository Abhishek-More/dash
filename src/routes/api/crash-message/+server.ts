import Twilio from 'twilio';
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { TEST_PHONE_NUMBER, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from '$env/static/private';

// POST route to send a text message
// request body:
//     name: string
//     phoneNumber: number
//     location: string
// returns:
//     nothing
export const POST: RequestHandler = async ({ request }) => {
    let { name, phoneNumber, location } = await request.json();

    if (phoneNumber === "")
    {
        phoneNumber = TEST_PHONE_NUMBER;
    }

    const twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    try {
        // await twilioClient.messages.create({
        //     body: `${name}'s Dash has detected a crash at ${location}. Please contact them immediately or send help.`,
        //     to: phoneNumber,
        //     from: TWILIO_PHONE_NUMBER
        // });
        await twilioClient.calls.create({
            twiml: `<Response><Say voice="alice">Hello. ${name}'s Dash has detected a crash at ${location}. They have listed you as an emergency contact. Please contact them immediately or send help.</Say></Response>`,
            to: phoneNumber,
            from: TWILIO_PHONE_NUMBER
        });
    } catch (e) {
        console.error(e);
        return error(500, e.message);
    }

    return json({});
};
