import { redirect } from 'next/navigation';

interface ClassPageProps {
  params: {
    classId: string;
  };
}

const ClassPage = ({ params }: ClassPageProps) => {
  redirect(`/list/results/${params.classId}/exam`);
};

export default ClassPage; 