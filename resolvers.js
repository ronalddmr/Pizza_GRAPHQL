const{db} = require('./cnn');

const pizzaResolver = {
    Query: {
        pizzas(root,{id}){
            if(id == undefined)
            {
                return executeQuery('select * from pizza order by id desc',id);  
            }
            return executeQuery('select * from pizza where id=$1', id);
        },
        ingredient(root,{id}){
            return executeQuery('select * from ingredient', id);   
        },
        pizzasAll(){
        return executeQuery('select * from pizza order by id desc');
           
        }
    },
    Pizza: {
        ingredients(pizzaInstance){
            const query = `select  ingredient.* from pizza_ingredients, ingredient
            where pizza_ingredients.ingredient_id = ingredient.id
            and pizza_ingredients.pizza_id = $1`;
            return executeQuery(query,pizzaInstance.id);
        }
    },
    Mutation : {
        async createPizza(root,{pizza}){
             if (pizza === undefined) return null;
             const query = 'INSERT INTO pizza (name, origin) VALUES ($1, $2) returning *;';
             let res= await db.one(query, [pizza.name, pizza.origin]);

             //Insertar Ingredientes
             if(res.id && pizza.ingredients && pizza.ingredients.length >0){
                 pizza.ingredients.forEach(ingredientId => {
                    const query = 'INSERT INTO public.pizza_ingredients(pizza_id, ingredient_id) VALUES ($1, $2);';  
                    executeQuery(query, [res.id, ingredientId]);
                });
             }
             return res;
        },
        async updatePizza(root,{pizza}){
            if (pizza === undefined) return null;
            const query = 'UPDATE public.pizza SET name=$2, origin=$3 WHERE id=$1 returning *;';
            let res= await db.one(query, [pizza.id,pizza.name, pizza.origin]);

            //Borra los ingtedientes Ingredientes
            executeQuery('DELETE FROM pizza_ingredients where pizza_id=$1',[res.id])
             if(res.id && pizza.ingredients && pizza.ingredients.length >0){
                   pizza.ingredients.forEach(ingredientId => {
                   const query = 'INSERT INTO public.pizza_ingredients(pizza_id, ingredient_id) VALUES ($1, $2);';  
                   executeQuery(query, [res.id, ingredientId]);
               });
            }
            
            return res;
       },
       async deletePizza(root,{id}){
        if (id === undefined) return null;
        //Eliminar Pizza
        executeQuery('DELETE FROM pizza_ingredients where pizza_id=$1',[id]);
        const query = 'DELETE FROM pizza WHERE id=$1 returning *;';
        let res= await db.one(query, [id]);
        return res;
   }


    }
    

}

function executeQuery(query, parameters){
    let dataset = db.any(query, parameters)
    .then(res => res)
    .catch(err => err)
return dataset; 
}

export default pizzaResolver;