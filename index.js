const { createDatabase } = require('./create-database');
const db = createDatabase();

const getUser = async function getUser(id) {
  const [ user ] = await db.getUsers(id);
  const workouts = await db.getWorkoutsByUserId(user.id);
  const allLifts = await Promise.all(workouts.map(workout => db.getLiftsByWorkoutId(workout.id)));

  const workoutsWithLifts = workouts.map(workout => {
    const lifts = allLifts.find(lifts => lifts.some(lift => lift.workout_id === workout.id));
    return Object.assign({}, workout, { lifts });
  });

  return Object.assign( {}, user, { workouts: workoutsWithLifts });
};

getUser(1).then(user => {
  console.log(JSON.stringify(user));
})
