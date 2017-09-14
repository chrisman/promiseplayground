# Promise Playground

A couple of suggestions on using promises

## Flatten nested promises with `Promise.all`

Sometimes you need the return value of one Promise to do stuff in a subsequent Promise. It may feel tempting to just nest all those promises, but this is problematic.

1. Makes reading them difficult.

2. If you need return value 1 at the end of a chain of, say, 3 nested Promises, it's not available to you any longer.

`Promise.all` can return non-promise values, as this example from [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) shows:

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
that means you can easily do not this:

```javascript
get_thing(id).then(thing =>
  get_other_thing(thing.id).then(other_thing =>
    get_final_thing(other_thing.id)))
```

But this:

```javascript
get_thing(id).then(thing => Promise.all([
  thing,
  get_other_thing(thing.id)
]))
.then([thing, other_thing] => Promise.all([
  thing,
  other_thing,
  get_final_thing(other_thing.id)
]))
.then([thing, other_thing, final_thing] => {
  /* do stuff */
})
```

Then you have nice flat promises, and you have all of your values in the final block to do stuff with.

## mind your iterations

If you have a list of things you need to perform async operations on, you can't just loop iteratively over them:

```javascript
ids.forEach(id => {
  db.getThing(id).then(thing => { /* do stuff */});
});

return;
```

The promises above are returned asynchronously; The loop will finish and you'll hit the return before all the values are returned.

Instead you can do something like this:

```javascript
Promise.all(ids.map(id => db.getThing(id))).then(things => { /* do something with things */})
```

And, if you're using async functions, this gets really straightforward:

```javascript
async function() {
  const things = await Promise.all(ids.map(id => db.getThing(id)));
  /* do stuff */
  return things;
}
```

## also

See the `async-await` branch for a version of index.js even more readable and simple using async/await.
