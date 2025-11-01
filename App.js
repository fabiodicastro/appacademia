import React, { useMemo, useReducer, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { v4 as uuidv4 } from 'uuid';

const initialExercises = [
  {
    id: 'supino_reto',
    name: 'Supino Reto',
    muscleGroup: 'Peitoral',
    equipment: 'Barra ou halteres',
    description: 'Clássico exercício de peito para força e hipertrofia.',
  },
  {
    id: 'agachamento_livre',
    name: 'Agachamento Livre',
    muscleGroup: 'Pernas e glúteos',
    equipment: 'Barra',
    description: 'Exercício composto para membros inferiores e core.',
  },
  {
    id: 'remada_curvada',
    name: 'Remada Curvada',
    muscleGroup: 'Costas',
    equipment: 'Barra ou halteres',
    description: 'Ativa dorsais e romboides com apoio do core.',
  },
];

const students = [
  { id: 'ana', name: 'Ana Souza' },
  { id: 'bruno', name: 'Bruno Lima' },
];

const initialState = {
  exercises: initialExercises,
  workouts: [],
  assignments: {
    ana: [],
    bruno: [],
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_EXERCISE':
      return {
        ...state,
        exercises: [...state.exercises, action.payload],
      };
    case 'CREATE_WORKOUT':
      return {
        ...state,
        workouts: [...state.workouts, action.payload],
      };
    case 'ASSIGN_WORKOUT': {
      const { studentId, workoutId } = action.payload;
      const currentAssignments = state.assignments[studentId] || [];
      if (currentAssignments.includes(workoutId)) {
        return state;
      }
      return {
        ...state,
        assignments: {
          ...state.assignments,
          [studentId]: [...currentAssignments, workoutId],
        },
      };
    }
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentUser, setCurrentUser] = useState(null);

  const workoutsById = useMemo(() => {
    const map = new Map();
    state.workouts.forEach((workout) => {
      map.set(workout.id, workout);
    });
    return map;
  }, [state.workouts]);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <View style={styles.container}>
          <Header onLogout={handleLogout} currentUser={currentUser} />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {currentUser.role === 'admin' && (
              <AdminDashboard dispatch={dispatch} exercises={state.exercises} />
            )}
            {currentUser.role === 'professor' && (
              <TeacherDashboard
                dispatch={dispatch}
                exercises={state.exercises}
                workouts={state.workouts}
                assignments={state.assignments}
              />
            )}
            {currentUser.role === 'usuario' && (
              <UserDashboard
                workoutsById={workoutsById}
                assignments={state.assignments}
                studentId={currentUser.studentId}
              />
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

function Header({ onLogout, currentUser }) {
  const roleLabel =
    currentUser.role === 'admin'
      ? 'Administrador'
      : currentUser.role === 'professor'
      ? 'Professor'
      : 'Aluno';

  const subtitle =
    currentUser.role === 'usuario'
      ? students.find((student) => student.id === currentUser.studentId)?.name
      : null;

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>App Academia</Text>
        <Text style={styles.headerSubtitle}>{roleLabel}</Text>
        {subtitle ? <Text style={styles.headerStudent}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoginScreen({ onLogin }) {
  const [showStudents, setShowStudents] = useState(false);

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginTitle}>Bem-vindo!</Text>
      <Text style={styles.loginSubtitle}>Escolha o tipo de acesso:</Text>

      <RoleButton label="Administrador" onPress={() => onLogin({ role: 'admin' })} />
      <RoleButton label="Professor" onPress={() => onLogin({ role: 'professor' })} />

      <RoleButton
        label="Aluno"
        onPress={() => setShowStudents((previous) => !previous)}
      />

      {showStudents ? (
        <View style={styles.studentSelector}>
          <Text style={styles.loginSubtitle}>Escolha seu nome:</Text>
          {students.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentButton}
              onPress={() => onLogin({ role: 'usuario', studentId: student.id })}
            >
              <Text style={styles.studentButtonText}>{student.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function RoleButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.roleButton} onPress={onPress}>
      <Text style={styles.roleButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function AdminDashboard({ exercises, dispatch }) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Informe o nome do exercício.');
      return;
    }

    const newExercise = {
      id: uuidv4(),
      name: name.trim(),
      muscleGroup: muscleGroup.trim() || 'Geral',
      equipment: equipment.trim() || 'Peso corporal',
      description: description.trim(),
    };

    dispatch({ type: 'ADD_EXERCISE', payload: newExercise });
    setName('');
    setMuscleGroup('');
    setEquipment('');
    setDescription('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Cadastro de exercícios</Text>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Supino inclinado"
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Grupo muscular</Text>
        <TextInput
          style={styles.input}
          placeholder="Peitoral"
          value={muscleGroup}
          onChangeText={setMuscleGroup}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Equipamento</Text>
        <TextInput
          style={styles.input}
          placeholder="Halteres"
          value={equipment}
          onChangeText={setEquipment}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Detalhes ou dicas de execução"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Adicionar exercício</Text>
      </TouchableOpacity>

      <Text style={[styles.cardSubtitle, styles.exerciseListTitle]}>Exercícios cadastrados</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExerciseItem exercise={item} />}
        scrollEnabled={false}
      />
    </View>
  );
}

function ExerciseItem({ exercise }) {
  return (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <Text style={styles.exerciseMeta}>{exercise.muscleGroup}</Text>
      <Text style={styles.exerciseMeta}>{exercise.equipment}</Text>
      {exercise.description ? (
        <Text style={styles.exerciseDescription}>{exercise.description}</Text>
      ) : null}
    </View>
  );
}

function TeacherDashboard({ exercises, dispatch, workouts, assignments }) {
  const [draftName, setDraftName] = useState('');
  const [draftGoal, setDraftGoal] = useState('');
  const [draftEntries, setDraftEntries] = useState([]);

  const addExerciseToDraft = (exercise) => {
    setDraftEntries((previous) => [
      ...previous,
      {
        id: uuidv4(),
        exerciseId: exercise.id,
        name: exercise.name,
        load: '',
        repetitions: '',
        rest: '60',
      },
    ]);
  };

  const updateEntry = (entryId, field, value) => {
    setDraftEntries((previous) =>
      previous.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      )
    );
  };

  const removeEntry = (entryId) => {
    setDraftEntries((previous) => previous.filter((entry) => entry.id !== entryId));
  };

  const handleSave = () => {
    if (!draftName.trim()) {
      Alert.alert('Nome obrigatório', 'Dê um nome ao treino.');
      return;
    }
    if (draftEntries.length === 0) {
      Alert.alert('Sem exercícios', 'Adicione pelo menos um exercício ao treino.');
      return;
    }

    const hasIncompleteFields = draftEntries.some(
      (entry) => !entry.load.trim() || !entry.repetitions.trim() || !entry.rest.trim()
    );

    if (hasIncompleteFields) {
      Alert.alert('Campos pendentes', 'Preencha carga, repetições e descanso para todos.');
      return;
    }

    const workout = {
      id: uuidv4(),
      name: draftName.trim(),
      goal: draftGoal.trim(),
      exercises: draftEntries.map((entry) => ({
        exerciseId: entry.exerciseId,
        name: entry.name,
        load: entry.load.trim(),
        repetitions: entry.repetitions.trim(),
        rest: Number(entry.rest.trim()),
      })),
    };

    dispatch({ type: 'CREATE_WORKOUT', payload: workout });
    setDraftName('');
    setDraftGoal('');
    setDraftEntries([]);
    Alert.alert('Treino salvo', 'O treino foi criado com sucesso.');
  };

  const handleAssign = (workoutId, studentId) => {
    dispatch({ type: 'ASSIGN_WORKOUT', payload: { workoutId, studentId } });
    Alert.alert('Treino atribuído', 'Plano disponível para o aluno selecionado.');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Montagem de fichas</Text>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nome do treino</Text>
        <TextInput
          style={styles.input}
          placeholder="Treino A - Força"
          value={draftName}
          onChangeText={setDraftName}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Objetivo</Text>
        <TextInput
          style={styles.input}
          placeholder="Hipertrofia superior"
          value={draftGoal}
          onChangeText={setDraftGoal}
        />
      </View>

      <Text style={styles.cardSubtitle}>Adicionar exercícios</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseSelector}
            onPress={() => addExerciseToDraft(item)}
          >
            <Text style={styles.exerciseSelectorText}>{item.name}</Text>
            <Text style={styles.exerciseSelectorMeta}>{item.muscleGroup}</Text>
            <Text style={styles.exerciseSelectorAction}>Adicionar</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.cardSubtitle}>Ficha em edição</Text>
      {draftEntries.length === 0 ? (
        <Text style={styles.emptyState}>Nenhum exercício adicionado ainda.</Text>
      ) : (
        draftEntries.map((entry) => (
          <View key={entry.id} style={styles.workoutEntry}>
            <Text style={styles.exerciseName}>{entry.name}</Text>
            <View style={styles.entryRow}>
              <View style={styles.entryField}>
                <Text style={styles.entryLabel}>Carga (kg)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={entry.load}
                  onChangeText={(value) => updateEntry(entry.id, 'load', value)}
                  placeholder="20"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.entryField}>
                <Text style={styles.entryLabel}>Repetições</Text>
                <TextInput
                  style={styles.smallInput}
                  value={entry.repetitions}
                  onChangeText={(value) => updateEntry(entry.id, 'repetitions', value)}
                  placeholder="12"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.entryField}>
                <Text style={styles.entryLabel}>Descanso (s)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={entry.rest}
                  onChangeText={(value) => updateEntry(entry.id, 'rest', value)}
                  placeholder="60"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeEntry(entry.id)}
            >
              <Text style={styles.removeButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Salvar treino</Text>
      </TouchableOpacity>

      <Text style={styles.cardSubtitle}>Treinos criados</Text>
      {workouts.length === 0 ? (
        <Text style={styles.emptyState}>Nenhuma ficha cadastrada ainda.</Text>
      ) : (
        workouts.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            {workout.goal ? <Text style={styles.workoutGoal}>{workout.goal}</Text> : null}
            {workout.exercises.map((exercise) => (
              <View key={exercise.exerciseId + exercise.name} style={styles.workoutExercise}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.repetitions} reps • {exercise.load} kg • descanso {exercise.rest}s
                </Text>
              </View>
            ))}
            <Text style={styles.assignmentTitle}>Atribuir para:</Text>
            <View style={styles.assignmentRow}>
              {students.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  style={styles.assignmentButton}
                  onPress={() => handleAssign(workout.id, student.id)}
                >
                  <Text style={styles.assignmentButtonText}>{student.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AssignedStudents
              workoutId={workout.id}
              assignments={assignments}
            />
          </View>
        ))
      )}
    </View>
  );
}

function AssignedStudents({ workoutId, assignments }) {
  const assigned = Object.entries(assignments)
    .filter(([, workoutIds]) => workoutIds.includes(workoutId))
    .map(([studentId]) => students.find((student) => student.id === studentId)?.name)
    .filter(Boolean);

  if (assigned.length === 0) {
    return null;
  }

  return (
    <View style={styles.assignedList}>
      <Text style={styles.assignedListTitle}>Atribuído para: {assigned.join(', ')}</Text>
    </View>
  );
}

function UserDashboard({ workoutsById, assignments, studentId }) {
  const workoutIds = assignments[studentId] || [];

  if (workoutIds.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Treinos disponíveis</Text>
        <Text style={styles.emptyState}>Nenhum treino atribuído no momento.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Treinos disponíveis</Text>
      {workoutIds.map((workoutId) => {
        const workout = workoutsById.get(workoutId);
        if (!workout) {
          return null;
        }
        return (
          <View key={workout.id} style={styles.workoutCard}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            {workout.goal ? <Text style={styles.workoutGoal}>{workout.goal}</Text> : null}
            {workout.exercises.map((exercise) => (
              <View key={exercise.exerciseId + exercise.name} style={styles.userExercise}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.repetitions} reps • {exercise.load} kg
                </Text>
                <RestTimer seconds={exercise.rest} />
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function RestTimer({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  React.useEffect(() => {
    let interval;
    if (isRunning && remaining > 0) {
      interval = setInterval(() => {
        setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, remaining]);

  const startTimer = () => {
    setRemaining(seconds);
    setIsRunning(true);
  };

  React.useEffect(() => {
    if (isRunning && remaining === 0) {
      setIsRunning(false);
      Alert.alert('Tempo!', 'Descanso finalizado, vamos para a próxima série.');
    }
  }, [isRunning, remaining]);

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerLabel}>Descanso: {remaining}s</Text>
      <TouchableOpacity
        style={[styles.primaryButton, styles.timerButton]}
        onPress={startTimer}
      >
        <Text style={styles.primaryButtonText}>Iniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A2647',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F4F8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#144272',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#D9E4F5',
    fontSize: 16,
    marginTop: 4,
  },
  headerStudent: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#F55353',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A2647',
    paddingHorizontal: 24,
  },
  loginTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  loginSubtitle: {
    color: '#D9E4F5',
    fontSize: 16,
    marginBottom: 16,
  },
  roleButton: {
    backgroundColor: '#205295',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginVertical: 8,
    width: '100%',
  },
  roleButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  studentSelector: {
    marginTop: 16,
    width: '100%',
    backgroundColor: '#144272',
    padding: 16,
    borderRadius: 16,
  },
  studentButton: {
    backgroundColor: '#205295',
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  studentButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A2647',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
    marginTop: 16,
    marginBottom: 8,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#205295',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B6C9E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#205295',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseListTitle: {
    marginTop: 20,
  },
  exerciseItem: {
    borderWidth: 1,
    borderColor: '#E1E9F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2647',
  },
  exerciseMeta: {
    fontSize: 13,
    color: '#556A92',
    marginTop: 4,
  },
  exerciseDescription: {
    fontSize: 13,
    color: '#6C7BA1',
    marginTop: 8,
  },
  exerciseSelector: {
    borderWidth: 1,
    borderColor: '#E1E9F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F8FBFF',
  },
  exerciseSelectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A2647',
  },
  exerciseSelectorMeta: {
    fontSize: 13,
    color: '#556A92',
    marginTop: 4,
  },
  exerciseSelectorAction: {
    fontSize: 13,
    color: '#205295',
    marginTop: 8,
    fontWeight: '600',
  },
  emptyState: {
    fontSize: 14,
    color: '#6C7BA1',
    marginBottom: 12,
  },
  workoutEntry: {
    borderWidth: 1,
    borderColor: '#D5E1F3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F4F8FF',
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  entryField: {
    flex: 1,
    marginRight: 8,
  },
  entryLabel: {
    fontSize: 12,
    color: '#556A92',
    marginBottom: 4,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#B6C9E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  removeButtonText: {
    color: '#F55353',
    fontWeight: '600',
  },
  workoutCard: {
    borderWidth: 1,
    borderColor: '#D5E1F3',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#F8FBFF',
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2647',
  },
  workoutGoal: {
    fontSize: 14,
    color: '#556A92',
    marginTop: 4,
    marginBottom: 12,
  },
  workoutExercise: {
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 13,
    color: '#556A92',
    marginTop: 12,
  },
  assignmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  assignmentButton: {
    backgroundColor: '#205295',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  assignmentButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  assignedList: {
    marginTop: 8,
  },
  assignedListTitle: {
    fontSize: 13,
    color: '#205295',
  },
  userExercise: {
    borderTopWidth: 1,
    borderTopColor: '#E1E9F5',
    paddingTop: 12,
    marginTop: 12,
  },
  timerContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerLabel: {
    fontSize: 14,
    color: '#0A2647',
  },
  timerButton: {
    width: 110,
    marginTop: 0,
  },
});
