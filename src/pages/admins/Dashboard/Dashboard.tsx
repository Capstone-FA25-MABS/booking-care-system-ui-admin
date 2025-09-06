import MainLayout from '@/layouts/MainLayout';
import styles from './Dashboard.module.scss';

const Dashboard: React.FC = () => {
    return (
        <MainLayout>
            <h1 className={styles.title}>Dashboard</h1>
        </MainLayout>
    );
};

export default Dashboard;
