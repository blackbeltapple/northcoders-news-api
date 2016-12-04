QUESTIONS
The original NC API behaves strangely for PUT api/comments/comment_id. It seems to work, but returns no content and a status 204. Compared to the article PUT equivalent upvote/downvote - which returns the whole modified comment


COMPLETED
Cool way to create valid but non-existant article ID - in seed file, create an article, copy its id, delete the article.



MUST HAVE:
// TODO add the route /articles/:article_id here to help wit hte ASYNC stuff
// TODO GET articles should also retreve the number of comments


NICE TO HAVE:
// TODO params should handle uppercase and lowercase versions - NC news only handles lowercase!
