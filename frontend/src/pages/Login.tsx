import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Alert,
  Stack,
  Group,
  Box,
} from '@mantine/core';
import { IconUser, IconLock, IconShield } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username.trim()) {
      setValidationError('Username is required');
      return false;
    }
    if (!password.trim()) {
      setValidationError('Password is required');
      return false;
    }
    if (username.length < 3) {
      setValidationError('Username must be at least 3 characters');
      return false;
    }
    if (password.length < 3) {
      setValidationError('Password must be at least 3 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) {
      return;
    }

    const success = await login(username, password);
    if (success) {
      navigate('/');
    }
  };

  const currentError = validationError || error;

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Container size="xs">
        <Paper
          withBorder
          shadow="xl"
          p="xl"
          radius="md"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
          }}
        >
          <Stack gap="lg">
            {/* Logo and Title */}
            <Stack gap="xs" align="center">
              <Group gap="sm" align="center">
                <IconShield size={48} color="#262626" />
                <Title 
                  order={1} 
                  size="h2" 
                  style={{ 
                    color: '#262626',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                  }}
                >
                  SpamShield
                </Title>
              </Group>
              <Text c="dimmed" size="sm" ta="center">
                Sign in to access the email security analysis platform
              </Text>
            </Stack>

            {/* Error Alert */}
            {currentError && (
              <Alert
                variant="filled"
                title="Login Error"
                styles={{
                  root: {
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                  },
                  title: {
                    color: '#ffffff',
                  },
                  body: {
                    color: '#ffffff',
                  },
                }}
              >
                {currentError}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Username"
                  placeholder="Enter your username"
                  leftSection={<IconUser size={16} />}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  styles={{
                    label: {
                      color: '#262626',
                      fontWeight: 500,
                    },
                    input: {
                      borderColor: '#d4d4d4',
                      '&:focus': {
                        borderColor: '#262626',
                      },
                    },
                  }}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  leftSection={<IconLock size={16} />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  styles={{
                    label: {
                      color: '#262626',
                      fontWeight: 500,
                    },
                    input: {
                      borderColor: '#d4d4d4',
                      '&:focus': {
                        borderColor: '#262626',
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  size="md"
                  loading={isLoading}
                  fullWidth
                  mt="md"
                  styles={{
                    root: {
                      backgroundColor: '#262626',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#404040',
                      },
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;