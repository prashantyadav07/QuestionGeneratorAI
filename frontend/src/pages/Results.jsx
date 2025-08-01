import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';

const Results = () => {
    const location = useLocation();
    const results = location.state?.results;

    // Agar user direct URL se aaye ya state na ho, to use wapas bhej do.
    if (!results) {
        return <Navigate to="/upload" replace />;
    }

    const { score, totalQuestions, percentage, results: detailedResults } = results;

    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <Card className="text-center mb-8">
                <h1 className="text-3xl font-bold">Test Complete!</h1>
                <p className="text-5xl font-bold mt-4 text-indigo-600">{percentage}%</p>
                <p className="text-xl text-gray-700 mt-2">You scored {score} out of {totalQuestions}</p>
                 <Link to="/upload" className="mt-6 inline-block bg-indigo-600 text-white font-bold py-2 px-6 rounded-md">
                    Take Another Test
                </Link>
            </Card>

            <h2 className="text-2xl font-bold mb-4">Detailed Results</h2>
            <div className="space-y-4">
                {detailedResults.map((item, index) => (
                    <Card key={item.questionId}>
                        <p className="font-bold">{index + 1}. {item.questionText}</p>
                        <div className={`mt-2 p-2 rounded-md flex items-start ${item.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                           {item.isCorrect ? <CheckCircle className="text-green-600 mr-2 flex-shrink-0"/> : <XCircle className="text-red-600 mr-2 flex-shrink-0"/>}
                           <div>
                                <span className="font-semibold">Your Answer: </span>
                                {item.userAnswer || 'Not Answered'}
                           </div>
                        </div>
                        {!item.isCorrect && (
                            <div className="mt-2 p-2 rounded-md bg-gray-100">
                                <span className="font-semibold">Correct Answer: </span>
                                {item.correctAnswer}
                            </div>
                        )}
                         <div className="mt-2 text-sm text-gray-600">
                            <p><span className="font-semibold">Explanation:</span> {item.explanation}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Results;