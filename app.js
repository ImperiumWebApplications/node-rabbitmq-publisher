const express = require('express');
const app = express();
const amqp = require('amqplib/callback_api');

const PORT = process.env.PORT || 3000;
const QUEUE_NAME = 'test_queue';
const RABBITMQ_URL = 'amqp://127.0.0.1';

app.use(express.json());

app.post('/publish', (req, res) => {
  amqp.connect(RABBITMQ_URL, (err, connection) => {
    if (err) {
      console.error(`Failed to connect to RabbitMQ: ${err.message}`);
      return res.status(500).send('Failed to connect to RabbitMQ');
    }

    connection.createChannel((err, channel) => {
      if (err) {
        console.error(`Failed to create channel: ${err.message}`);
        return res.status(500).send('Failed to create channel');
      }

      const message = JSON.stringify(req.body);

      channel.assertQueue(QUEUE_NAME, { durable: false });
      channel.sendToQueue(QUEUE_NAME, Buffer.from(message));

      console.log(`Message published: ${message}`);
      res.status(200).send('Message published');
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

