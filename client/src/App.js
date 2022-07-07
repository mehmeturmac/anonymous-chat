import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MESSAGES, CREATE_MESSAGE, MESSAGE_SUBS } from './queries';
import { Col, Row, Input, Form, Spin } from 'antd';

function App() {
  const [fromMe, setFromMe] = useState(false);
  const { loading: query_loading, data: query_data, subscribeToMore } = useQuery(GET_MESSAGES);
  const [saveMessage] = useMutation(CREATE_MESSAGE);

  useEffect(() => {
    subscribeToMore({
      document: MESSAGE_SUBS,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          messages: [subscriptionData.data.messageCreated, ...prev.messages],
        };
      },
    });
  }, [subscribeToMore]);

  if (query_loading || !query_data) {
    return <Spin delay={300} size="middle" tip="Loading..." />;
  }

  const onFinish = async (values) => {
    setFromMe(true);
    try {
      await saveMessage({
        variables: {
          data: {
            message: values.message,
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="App">
      <Row>
        <Col md={{ span: 8, offset: 8 }} className="chat-bg">
          {query_data.messages.map((message) => (
            <Row justify="start" key={message.id}>
              <p className="chat-message">{message.message}</p>
            </Row>
          ))}
        </Col>
        <Col md={{ span: 8, offset: 8 }}>
          <Form layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item name="message">
              <Input size="large" />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default App;
