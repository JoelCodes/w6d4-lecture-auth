app.post('/token', async (req, res) => {
  const userId = req.session.userId;
  const user = await userService.getUserById(userId);
  if (user) {
    const exp = Math.floor(new Date().getTime() / 1000) + 10;
    res.send(jwt.sign({ id: user.id }, TOKEN_SECRET));
  } else {
    res.sendStatus(401);
  }
});
