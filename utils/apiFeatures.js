class APIFeatures {
  //mongoose query and queryString
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1 ) filtering

    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));

    return this; //in that case it is going to return entire object
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      //right we did not delete it from this object
      this.query = this.query.sort(sortBy); // so basically we are adding it to mongoose query object
      //sort('price ratingAverage') -> second is going to be use in case of  the same values
    } else {
      //default sort
      this.query = this.query.sort('-createdAt');
    }
    return this; //in that case it is going to return entire object
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // query.select("name duration price") <- they call it projecting
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this; //in that case it is going to return entire object
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //nice short way
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // -1 because "requested" is last "limit"

    //page=2&limit=10, 1-10, page 1, 11-20, page 2, 21-30 page 3
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    return this; //in that case it is going to return entire object
  }
}

module.exports = APIFeatures;
