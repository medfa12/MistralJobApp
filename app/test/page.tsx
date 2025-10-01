'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArtifactRenderer } from '@/components/artifact';
import { ArtifactData } from '@/components/artifact/types';

// Sample artifacts for testing
const sampleArtifacts: { [key: string]: ArtifactData } = {
  'react-button': {
    code: `function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#FF8205' }}>Counter App</h1>
      <div style={{ 
        margin: '20px 0', 
        padding: '20px', 
        border: '2px solid #FF8205',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '24px', marginBottom: '10px' }}>
          Count: <strong>{count}</strong>
        </p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            backgroundColor: '#FF8205',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          style={{
            backgroundColor: '#FA500F',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Decrement
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            backgroundColor: '#666',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// Render the app
window.App = App;`,
    type: 'react',
  },

  'html-card': {
    code: `<div style="max-width: 400px; margin: 20px auto; font-family: Arial, sans-serif;">
  <div style="
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  ">
    <div style="
      background: linear-gradient(135deg, #FA500F 0%, #FF8205 100%);
      padding: 30px;
      color: white;
    ">
      <h2 style="margin: 0 0 10px 0; font-size: 24px;">Mistral AI</h2>
      <p style="margin: 0; opacity: 0.9;">Frontier AI in your hands</p>
    </div>
    
    <div style="padding: 20px;">
      <h3 style="color: #2d3748; margin: 0 0 10px 0;">Features</h3>
      <ul style="color: #4a5568; line-height: 1.8;">
        <li>🚀 Lightning-fast responses</li>
        <li>🎯 High accuracy</li>
        <li>💡 Creative outputs</li>
        <li>🔒 Secure and private</li>
      </ul>
      
      <button style="
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #FA500F 0%, #FF8205 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 15px;
      ">
        Get Started
      </button>
    </div>
  </div>
</div>`,
    type: 'html',
  },

  'interactive-form': {
    code: `function App() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '20px auto', 
      padding: '30px',
      backgroundColor: '#f7fafc',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>Contact Form</h2>
      
      {submitted && (
        <div style={{
          padding: '10px',
          backgroundColor: '#48bb78',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          ✓ Form submitted successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #FA500F 0%, #FF8205 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Submit
        </button>
      </form>
    </div>
  );
}

window.App = App;`,
    type: 'react',
  },

  'dashboard-layout': {
    code: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 20px; background-color: #f5f5f5;">
  <!-- Card 1 -->
  <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin-right: 15px;">
        📊
      </div>
      <div>
        <h3 style="margin: 0; color: #2d3748;">Total Users</h3>
        <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">Active accounts</p>
      </div>
    </div>
    <p style="font-size: 32px; font-weight: bold; color: #2d3748; margin: 0;">12,845</p>
    <p style="color: #48bb78; font-size: 14px; margin: 10px 0 0 0;">↑ 12% from last month</p>
  </div>

  <!-- Card 2 -->
  <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FA500F 0%, #FF8205 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin-right: 15px;">
        💰
      </div>
      <div>
        <h3 style="margin: 0; color: #2d3748;">Revenue</h3>
        <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">This month</p>
      </div>
    </div>
    <p style="font-size: 32px; font-weight: bold; color: #2d3748; margin: 0;">$54,239</p>
    <p style="color: #48bb78; font-size: 14px; margin: 10px 0 0 0;">↑ 8% from last month</p>
  </div>

  <!-- Card 3 -->
  <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin-right: 15px;">
        📈
      </div>
      <div>
        <h3 style="margin: 0; color: #2d3748;">API Calls</h3>
        <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">Last 24 hours</p>
      </div>
    </div>
    <p style="font-size: 32px; font-weight: bold; color: #2d3748; margin: 0;">1.2M</p>
    <p style="color: #48bb78; font-size: 14px; margin: 10px 0 0 0;">↑ 23% from yesterday</p>
  </div>

  <!-- Card 4 -->
  <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin-right: 15px;">
        ⚡
      </div>
      <div>
        <h3 style="margin: 0; color: #2d3748;">Performance</h3>
        <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">Avg response time</p>
      </div>
    </div>
    <p style="font-size: 32px; font-weight: bold; color: #2d3748; margin: 0;">127ms</p>
    <p style="color: #48bb78; font-size: 14px; margin: 10px 0 0 0;">↓ 15% faster</p>
  </div>
</div>`,
    type: 'html',
  },
};

export default function TestPage() {
  const [selectedArtifact, setSelectedArtifact] = useState<string>('react-button');
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, #FA500F, #FF8205)"
              bgClip="text"
              mb={4}
            >
              Mistral Artifacts Test Page
            </Heading>
            <Text fontSize="lg" color={textColor} opacity={0.8}>
              Test the artifact renderer with different code examples
            </Text>
          </Box>

          {/* Artifact Selector */}
          <Box>
            <Text mb={2} fontWeight="bold" color={textColor}>
              Select an Artifact:
            </Text>
            <Select
              value={selectedArtifact}
              onChange={(e) => setSelectedArtifact(e.target.value)}
              size="lg"
              bg={useColorModeValue('white', 'gray.800')}
            >
              <option value="react-button">React Counter App</option>
              <option value="html-card">HTML Card Component</option>
              <option value="interactive-form">Interactive Form</option>
              <option value="dashboard-layout">Dashboard Layout</option>
            </Select>
          </Box>

          {/* Artifact Renderer */}
          <ArtifactRenderer artifact={sampleArtifacts[selectedArtifact]} />

          {/* Instructions */}
          <Box
            p={6}
            bg={useColorModeValue('blue.50', 'blue.900')}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="blue.500"
          >
            <Heading size="md" mb={3} color={textColor}>
              How to Use:
            </Heading>
            <VStack align="start" spacing={2} color={textColor}>
              <Text>
                📄 <strong>Code Tab:</strong> View and copy the source code with syntax highlighting
              </Text>
              <Text>
                👁️ <strong>Preview Tab:</strong> See the live rendered output of the code
              </Text>
              <Text>
                🔍 <strong>Inspect Mode:</strong> Click the 🔍 icon in Preview tab to enable inspect mode. Hover over elements to highlight them, click to see detailed information in the side panel
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

