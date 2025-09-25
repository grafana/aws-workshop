import http from 'k6/http';
import {sleep, check} from 'k6';
import faker from "k6/x/faker";

export const options = {
    vus: 10,
    duration: '600s', // 10 minutes
};

export default function () {
    const url = __ENV.URL || 'http://localhost:4000/booking'; // Take environment variable or default to localhost

    // First simulate getting all the bookings
    const resGet = http.get(url, {
        headers: {
            'Accept': 'application/json',
        }
    });

    const payload = JSON.stringify({
        name: `${faker.person.name()} ${faker.strings.digitN(4)}`
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'K6 Load Test'
        }
    };
    const resPost = http.post(url, payload, params);

    sleep(1);
}
