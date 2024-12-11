package errors

type Error struct {
	Msg string
}

func (e *Error) Error() string {
	return e.Msg
}

func New(msg string) error {
	return &Error{Msg: msg}
}
