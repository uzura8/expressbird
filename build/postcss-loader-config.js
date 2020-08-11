module.exports = {
  loader: 'postcss-loader',// Setting for PostCSS
  options: {
    plugins: () => [
      // Enable Autoprefixer
      // Add vendor prefix
      require('autoprefixer')({
        grid: true, // use CSS Grid Layout
        flexbox: true,
        //browsers: [
        //  'last 2 versions',
        //  'ie >= 11'
        //]
      })
    ],
    sourceMap: true
  }
}
