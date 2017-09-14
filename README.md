# Promise Playground

A couple of suggestions on using promises

## Flatten nested promises with `Promise.all`

Sometimes you need the return value of one Promise to do stuff in a subsequent Promise. It may feel tempting to just nest all those promises, but this is problematic.

1. Makes reading them difficult.

2. You lose access to your values as you go: If you need return value 1 at the end of a chain of, say, 3 nested Promises, it's not available to you any longer.

Forunately, `Promise.all` can return non-promise values, as this example from [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) shows:

```javascript
var p1 = Promise.resolve(3);
var p2 = 1337;
var p3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

Promise.all([p1, p2, p3]).then(values => {
  console.log(values); // [3, 1337, "foo"]
});
```
which means you can avoid a nested chain of promises:

```javascript
get_thing(id).then(thing =>
  get_other_thing(thing.id).then(other_thing =>
    get_final_thing(other_thing.id)))
```

and instead use `Promise.all` to cascade each result down a flat chain of promises, and you have all of your values in the final block to do stuff with.

```javascript
get_thing(id).then(thing => Promise.all([
  thing,
  get_other_thing(thing.id)
]))
.then(([ thing, other_thing ]) => Promise.all([
  thing,
  other_thing,
  get_final_thing(other_thing.id)
]))
.then(([ thing, other_thing, final_thing ]) => {
  /* do stuff */
})
```

Note: `.then` is passed the single result of the promise it is chained to. In this example, it happens to always be a single array, the result of the `Promise.all`, which I am [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) along the way.

## Mind your iterations

If you have a list of things you need to perform async operations on, you can't just loop iteratively over them:

```javascript
ids.forEach(id => {
  db.getThing(id).then(thing => { /* do stuff */});
});

return;
```

This won't work because the promises above are returned asynchronously; The loop will finish and you'll hit the return before all the values are returned.

Instead you can do something like this:

```javascript
Promise.all(ids.map(id => db.getThing(id))).then(things => {
  /* do something with things */
})
```

You map your ids to a bunch of asyncronous calls. Then you have an array full of promises which you can pass to `Promise.all` to ensure that they all get resolved before moving on.

## Putting the two together

So say you're trying to flatten some promises, some of which will return multiple promises. For example, you have a blog, and you need to fetch a user, and then their posts, and then those posts' comments. Ideally you'd be using a SQL query builder or an ORM to do this, but for the purposes of demonstration:

```javascript
// get user:
getUser(id)
// get posts:
.then( (user) => Promise.all([
  user,             // a user object
  getPosts(user.id) // a PROMISE of an array of post objects
]))
// get comments:
.then( ([user, posts]) => Promise.all([
  user,
  posts,
  // 1. iterate over each post and fetch its comments
  // 2. pass this array of promises to its own Promise.all so they get resolved before moving on
  Promise.all(posts.map(post => getComments(post.id)))
]))
// do stuff:
.then( ([user, posts, comments]) => {
  /* e.g. assemble a new user object containing posts and post comments */
})
```

## Also try `async`/`await`

See the [`async-await` branch](https://github.com/chrisman/promiseplayground/blob/async-await/index.js) for a version of index.js even more readable and simple using async/await.
