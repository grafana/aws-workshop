exports.handler = async (event, context) => {
    for (const message of event.Records) {
        await processMessageAsync(message);
    }
    console.info("done");
};

async function processMessageAsync(message) {
    try {
        const messageBody = message.body;

        // Check for special message patterns that require additional delay
        if (messageBody.match(/(?:\/beholder|\/unicorn)/i)) {
            await new Promise(r => setTimeout(r, (Math.random() * 1000) + 500));
        }

        console.log(`Received a message: ${messageBody}`);

        // Simulate work processing time
        const workTime = (Math.random() * 30) + 20;
        await new Promise(resolve => setTimeout(resolve, workTime));

    } catch (err) {
        console.error("An error occurred processing message:", err);
        throw err;
    }
}
