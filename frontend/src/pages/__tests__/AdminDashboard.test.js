import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../AdminDashboard';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

const axios = require('axios').default;

describe('AdminDashboard', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: { _id: 'quiz-1', title: 'Demo Quiz' } });
  });

  it('shows admin quiz management controls', async () => {
    render(<AdminDashboard user={{ name: 'Ada', role: 'admin' }} />);

    expect(await screen.findByText(/admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create quiz/i })).toBeInTheDocument();
  });
});
