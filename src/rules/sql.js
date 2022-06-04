export default new Map([
  [/^.*(UPDATE .+SET )((?:"?[a-z\d_]+?"? = \?, )+"?[a-z\d_]+?"? = \?)([\s\S]+)\s*\[(.+)\]/m, (args) => {
    console.log(args);

    const delimiter = ', ';

    let sets = [];
    let templates = args[2].split(delimiter);
    let params = args[4].split(delimiter);

    templates.forEach((template, index) => {
      let param = params[index] ? '\'' + params[index] + '\'' : 'NULL';
      sets[index] = template.replace('?', param);
    });
    return args[1] + sets.join(delimiter) + args[3];
  }],
]);