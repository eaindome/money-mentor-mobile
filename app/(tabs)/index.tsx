import { StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect, useRef } from 'react';

type Question = {
  id: number;
  text: string;
  options: { text: string; emoji: string; value: string }[];
};


export default function TabOneScreen({ navigation }: { navigation: any }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Onboarding questions
  const questions: Question[] = [
    {
      id: 1,
      text: "What's your approximate monthly income?",
      options: [
        { text: "GHS 0-500", emoji: "💰", value: "low" },
        { text: "GHS 500+", emoji: "💵", value: "medium" },
        { text: "Prefer not to say", emoji: "🤐", value: "unknown" },
      ],
    },
    {
      id: 2,
      text: "What's your biggest financial fear?",
      options: [
        { text: "Losing money", emoji: "😟", value: "loss" },
        { text: "Complexity", emoji: "🤯", value: "complexity" },
        { text: "Not having enough", emoji: "😨", value: "scarcity" },
      ],
    },
    {
      id: 3,
      text: "What's your current financial goal?",
      options: [
        { text: "Save for a phone", emoji: "📱", value: "phone" },
        { text: "Travel", emoji: "✈️", value: "travel" },
        { text: "Emergency fund", emoji: "🆘", value: "emergency" },
      ],
    },
  ];

  // Pulsing animation for the button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered - process results
      const fearProfile = analyzeAnswers(answers);
      // In a real app, you would save to SQLite here
      console.log("User profile:", fearProfile);
      navigation.navigate('ChallengeHub', { fearProfile });
    }
  };

  const analyzeAnswers = (answers: Record<number, string>) => {
    // Simple analysis - in a real app you might use NLP here
    return {
      riskTolerance: answers[1] === "low" ? "conservative" : "moderate",
      primaryFear: answers[2] || "unknown",
      goal: answers[3] || "general",
    };
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      {currentQuestionIndex === 0 ? (
        <>
          <Text style={styles.title}>MoneyMentor</Text>
          <Text style={styles.subtitle}>Your Financial Confidence Coach</Text>
          <Text style={styles.tagline}>Let's make investment less scary!</Text>
        </>
      ) : null}

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.optionButton}
              onPress={() => handleAnswer(currentQuestion.id, option.value)}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.progressContainer}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentQuestionIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {currentQuestionIndex === 2 && (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => setCurrentQuestionIndex(1)}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#3498db',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  questionContainer: {
    width: '100%',
    marginBottom: 40,
    backgroundColor: '#f8f9fa',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    width: '100%',
    backgroundColor: "#f8f9fa"
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#f8f9fa',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#3498db',
  },
  inactiveDot: {
    backgroundColor: '#bdc3c7',
  },
  getStartedButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
