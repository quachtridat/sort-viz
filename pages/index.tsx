import Layout from '@/components/Layout';
import SortViz from '@/components/SortViz';

export const HomePage: React.FC = () => {
  return (
    <Layout title='Sorting Algorithm Visualizer' className='vh-100'>
      <SortViz />
    </Layout>
  );
}

export default HomePage;