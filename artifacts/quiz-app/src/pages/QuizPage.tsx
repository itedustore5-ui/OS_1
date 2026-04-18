import { useState, useEffect } from "react";
import { questions } from "@/data/questions";
import { api, ApiUser } from "@/lib/api";

interface QuizPageProps {
  user: ApiUser | null;
  onFinish: () => void;
  onLogout: () => void;
}

export default function QuizPage({ user, onFinish, onLogout }: QuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; selectedAnswer: number; correct: boolean }[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [imgError, setImgError] = useState(false);

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const progress = ((currentIndex) / totalQ) * 100;

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setImgError(false);
  }, [currentIndex]);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
  };

  const handleConfirm = async () => {
    if (selectedAnswer === null) return;
    const correct = selectedAnswer === currentQ.correctAnswer;
    const newAnswers = [...answers, { questionId: currentQ.id, selectedAnswer, correct }];
    setAnswers(newAnswers);
    setShowResult(true);

    if (currentIndex === totalQ - 1) {
      const score = newAnswers.filter(a => a.correct).length;
      setFinalScore(score);
      try {
        await api.saveResult({
          score,
          totalQuestions: totalQ,
          percentage: Math.round((score / totalQ) * 100),
          timeSpent: Math.round((Date.now() - startTime) / 1000),
          answers: newAnswers,
          displayName: user?.displayName || user?.username || "Korisnik",
        });
      } catch {
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const getOptionClass = (idx: number) => {
    const base = "w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-sm font-medium ";
    if (!showResult) {
      if (selectedAnswer === idx) return base + "border-blue-500 bg-blue-50 text-blue-800";
      return base + "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-gray-700";
    }
    if (idx === currentQ.correctAnswer) return base + "border-green-500 bg-green-50 text-green-800";
    if (idx === selectedAnswer && idx !== currentQ.correctAnswer) return base + "border-red-500 bg-red-50 text-red-800";
    return base + "border-gray-200 bg-gray-50 text-gray-400";
  };

  if (quizFinished) {
    const pct = Math.round((finalScore / totalQ) * 100);
    const passed = pct >= 60;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {passed ? (
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Квиз завршен!</h2>
          <p className="text-gray-500 mb-6">{user?.displayName}</p>
          <div className={`inline-block px-6 py-3 rounded-2xl mb-6 ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className="text-4xl font-bold">{pct}%</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">{finalScore}</p>
              <p className="text-xs text-gray-500">Тачних</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">{totalQ - finalScore}</p>
              <p className="text-xs text-gray-500">Нетачних</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">{totalQ}</p>
              <p className="text-xs text-gray-500">Укупно</p>
            </div>
          </div>
          <p className={`text-sm font-semibold mb-6 ${passed ? 'text-green-600' : 'text-red-500'}`}>
            {passed ? 'Честитамо! Положили сте тест.' : 'Нисте положили. Покушајте поново.'}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={onFinish} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
              Scoreboard
            </button>
            <button onClick={onLogout} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">
              Одјавите се
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 hidden sm:inline">IT Квиз</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-blue-600">{currentIndex + 1}</span>/{totalQ}
          </span>
          <span className="text-sm text-gray-500 hidden sm:inline">{user?.displayName}</span>
          <button onClick={onLogout} className="text-xs text-gray-400 hover:text-gray-600 transition px-2 py-1 rounded-lg hover:bg-gray-100">
            Одјава
          </button>
        </div>
      </div>

      <div className="bg-gray-200 h-1.5">
        <div className="bg-blue-600 h-1.5 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-xs font-medium uppercase tracking-wide">
                Питање {currentIndex + 1} од {totalQ}
              </span>
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                #{currentQ.id}
              </span>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-900 font-medium text-base leading-relaxed mb-6">
              {currentQ.question}
            </p>

            {currentQ.imageQuestion && !imgError && (
              <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={currentQ.imageQuestion}
                  alt={`Слика за питање ${currentQ.id}`}
                  className="w-full object-contain max-h-64"
                  onError={() => setImgError(true)}
                />
                <p className="text-center text-xs text-gray-400 py-1">
                  Слика за питање {currentQ.id}
                </p>
              </div>
            )}

            {currentQ.imageQuestion && imgError && (
              <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 text-center">
                <svg className="w-8 h-8 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-amber-700 text-sm font-medium">Слика за питање {currentQ.id}</p>
                <p className="text-amber-500 text-xs mt-1">Поставите слику на: {currentQ.imageQuestion}</p>
              </div>
            )}

            <div className="space-y-3">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={getOptionClass(idx)}
                  disabled={showResult}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 mt-0.5 ${
                      showResult && idx === currentQ.correctAnswer
                        ? 'bg-green-500 border-green-500 text-white'
                        : showResult && idx === selectedAnswer && idx !== currentQ.correctAnswer
                        ? 'bg-red-500 border-red-500 text-white'
                        : selectedAnswer === idx && !showResult
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-left">{option}</span>
                    {showResult && idx === currentQ.correctAnswer && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {showResult && idx === selectedAnswer && idx !== currentQ.correctAnswer && (
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showResult && (
              <div className={`mt-5 p-4 rounded-xl ${selectedAnswer === currentQ.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${selectedAnswer === currentQ.correctAnswer ? 'bg-green-500' : 'bg-red-500'}`}>
                    {selectedAnswer === currentQ.correctAnswer ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm mb-1 ${selectedAnswer === currentQ.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                      {selectedAnswer === currentQ.correctAnswer ? 'Тачно!' : 'Нетачно'}
                    </p>
                    <p className={`text-sm leading-relaxed ${selectedAnswer === currentQ.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 flex gap-3">
            {!showResult ? (
              <button
                onClick={handleConfirm}
                disabled={selectedAnswer === null}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all"
              >
                Потврди одговор
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                {currentIndex < totalQ - 1 ? 'Следеће питање →' : 'Завршите квиз'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1 justify-center">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-sm transition-colors ${
                i < answers.length
                  ? answers[i].correct ? 'bg-green-500' : 'bg-red-400'
                  : i === currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
              title={`Питање ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
